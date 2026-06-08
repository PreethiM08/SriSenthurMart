from rest_framework import serializers
from .models import Product, StockHistory


class ProductSerializer(serializers.ModelSerializer):
    is_in_stock = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'product_name', 'category', 'price','description',
            'quantity_value', 'quantity_unit', 'product_count',
            'image', 'image_url', 'is_in_stock', 'is_active',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_is_in_stock(self, obj):
        return obj.product_count > 0

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'product_name', 'category', 'price',
            'quantity_value', 'quantity_unit', 'product_count', 'image', 'description','is_active'
        )


class StockHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)

    class Meta:
        model = StockHistory
        fields = ('id', 'product', 'product_name', 'previous_stock', 'added_stock', 'new_stock', 'note', 'created_at')
        read_only_fields = ('id', 'previous_stock', 'new_stock', 'created_at')


class AddStockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)