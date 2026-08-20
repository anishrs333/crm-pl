from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'product_type', 'unit_price', 'tax_rate', 'is_active')
    list_filter = ('product_type', 'is_active')
    search_fields = ('name', 'sku')
