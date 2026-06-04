from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart
from .serializers import CartItemSerializer, CartSummarySerializer
from apps.products.models import Product


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's cart."""
        items = Cart.objects.filter(user=request.user).select_related('product')
        serializer = CartItemSerializer(items, many=True, context={'request': request})
        total = sum(item.total_price for item in items)
        return Response({
            'items': serializer.data,
            'products_count': items.count(),
            'total_amount': str(total)
        })

    def post(self, request):
        """Add item to cart or update quantity if exists."""
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if product.product_count < quantity:
            return Response({'error': 'Insufficient stock.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartItemSerializer(cart_item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request):
        """Clear entire cart."""
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared.'})


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Update quantity of a cart item."""
        try:
            item = Cart.objects.get(pk=pk, user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if quantity is not None:
            quantity = int(quantity)
            if quantity < 1:
                item.delete()
                return Response({'message': 'Item removed from cart.'})
            if item.product.product_count < quantity:
                return Response({'error': 'Insufficient stock.'}, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = quantity
            item.save()

        serializer = CartItemSerializer(item, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        """Remove a single item from cart."""
        try:
            item = Cart.objects.get(pk=pk, user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response({'message': 'Item removed.'})