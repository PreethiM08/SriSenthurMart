from rest_framework import serializers
from .models import Cart
from apps.products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ('id', 'product', 'product_id', 'quantity', 'total_price', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_product_id(self, value):
        from apps.products.models import Product
        try:
            product = Product.objects.get(pk=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError('Product not found or unavailable.')
        return value

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value


class CartSummarySerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    products_count = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)