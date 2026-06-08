from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.cart.models import Cart
from apps.products.models import Product


class CreateOrderView(APIView):
    """Create order from cart (or from a single product for Buy Now)."""
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # items can be passed directly (Buy Now) or pulled from cart
        items_data = request.data.get('items')

        if items_data:
            # Buy Now: items = [{'product_id': x, 'quantity': y}]
            order_items_info = []
            total = 0
            for item in items_data:
                try:
                    product = Product.objects.select_for_update().get(
                        pk=item['product_id'], is_active=True
                    )
                except Product.DoesNotExist:
                    return Response({'error': f"Product {item['product_id']} not found."}, status=404)
                qty = int(item['quantity'])
                if product.product_count < qty:
                    return Response({'error': f"Insufficient stock for {product.product_name}."}, status=400)
                order_items_info.append((product, qty))
                total += product.price * qty
        else:
            # From cart
            cart_items = Cart.objects.filter(user=request.user).select_related('product')
            if not cart_items.exists():
                return Response({'error': 'Cart is empty.'}, status=400)

            order_items_info = []
            total = 0
            for ci in cart_items:
                product = Product.objects.select_for_update().get(pk=ci.product_id)
                if product.product_count < ci.quantity:
                    return Response({'error': f"Insufficient stock for {product.product_name}."}, status=400)
                order_items_info.append((product, ci.quantity))
                total += product.price * ci.quantity

        # Create order
        order = Order.objects.create(user=request.user, total_amount=total)

        for product, qty in order_items_info:
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.product_name,
                quantity=qty,
                unit_price=product.price
            )
            product.product_count -= qty
            product.save()

        # Clear cart if order was from cart
        if not items_data:
            Cart.objects.filter(user=request.user).delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class UserOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


# Admin
class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().prefetch_related('items').select_related('user')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None
    filterset_fields = ['status']


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get("status")
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"},
                status=400
                )
        instance.status = new_status
        instance.save()
        return Response(
            OrderSerializer(instance).data
            )

    def partial_update(self, request, *args, **kwargs):
        # Only allow status updates from admin
        instance = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status.'}, status=400)
        instance.status = new_status
        instance.save()
        return Response(OrderSerializer(instance).data)

    