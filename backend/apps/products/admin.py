from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'product_type', 'category', 'unit_price', 'tax_percentage', 'is_active')
    list_filter = ('product_type', 'category', 'is_active')
    search_fields = ('name', 'sku', 'description')
