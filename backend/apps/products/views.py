from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, StockHistory
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer,
    StockHistorySerializer, AddStockSerializer
)


class ProductListView(generics.ListAPIView):
    """Public: list all active products with filtering."""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['product_name']
    ordering_fields = ['price', 'created_at', 'product_name']


class ProductDetailView(generics.RetrieveAPIView):
    """Public: single product detail."""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


# Admin-only product management
class AdminProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['product_name']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductSerializer


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductSerializer


@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_stock(request, pk):
    """Admin: increase stock for a product."""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AddStockSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    quantity = serializer.validated_data['quantity']
    note = serializer.validated_data.get('note', '')

    prev_stock = product.product_count
    product.product_count += quantity
    product.save()

    StockHistory.objects.create(
        product=product,
        previous_stock=prev_stock,
        added_stock=quantity,
        new_stock=product.product_count,
        note=note
    )

    return Response({
        'message': f'Stock updated. New stock: {product.product_count}',
        'product': ProductSerializer(product, context={'request': request}).data
    })


class StockHistoryView(generics.ListAPIView):
    serializer_class = StockHistorySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        product_id = self.kwargs.get('pk')
        return StockHistory.objects.filter(product_id=product_id)