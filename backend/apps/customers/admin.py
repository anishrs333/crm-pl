from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'customer_type', 'email', 'phone', 'city', 'account_manager', 'created_at')
    list_filter = ('customer_type', 'account_manager')
    search_fields = ('name', 'email', 'phone', 'city')
