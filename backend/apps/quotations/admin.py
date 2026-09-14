from django.contrib import admin
from .models import Quotation, QuotationItem


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1
    readonly_fields = ('line_subtotal', 'line_tax', 'line_total')


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = (
        'quote_number',
        'customer',
        'status',
        'valid_until',
        'subtotal',
        'tax_amount',
        'grand_total',
        'created_by',
        'created_at'
    )
    list_filter = ('status', 'valid_until', 'created_by')
    search_fields = ('quote_number', 'customer__name', 'notes')
    readonly_fields = ('quote_number', 'subtotal', 'tax_amount', 'grand_total', 'created_at', 'updated_at')
    inlines = [QuotationItemInline]
