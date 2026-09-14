from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    product_type_label = serializers.CharField(source='get_product_type_display', read_only=True)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    price_with_tax = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'sku',
            'name',
            'product_type',
            'product_type_label',
            'category',
            'category_label',
            'unit_price',
            'tax_percentage',
            'price_with_tax',
            'description',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_sku(self, value):
        return value.strip().upper()


class ProductSelectSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Product
        fields = ['id', 'sku', 'name', 'unit_price', 'tax_percentage']
