from django.contrib import admin
from .models import Quotation, QuotationItem


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('quote_number', 'customer', 'total_amount', 'status', 'valid_until', 'created_by', 'created_at')
    list_filter = ('status', 'created_by')
    search_fields = ('quote_number', 'customer__name')
    inlines = [QuotationItemInline]
