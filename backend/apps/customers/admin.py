from django.contrib import admin
from .models import Customer, CustomerContact, CustomerInteraction


class CustomerContactInline(admin.TabularInline):
    model = CustomerContact
    extra = 1


class CustomerInteractionInline(admin.TabularInline):
    model = CustomerInteraction
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'customer_type', 'email', 'phone', 'city', 'status', 'account_manager', 'created_at')
    list_filter = ('customer_type', 'status', 'account_manager')
    search_fields = ('name', 'email', 'phone', 'city', 'gst_number')
    inlines = [CustomerContactInline, CustomerInteractionInline]


@admin.register(CustomerContact)
class CustomerContactAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'customer', 'designation', 'email', 'phone', 'is_primary')
    list_filter = ('is_primary', 'customer')
    search_fields = ('first_name', 'last_name', 'email', 'customer__name')


@admin.register(CustomerInteraction)
class CustomerInteractionAdmin(admin.ModelAdmin):
    list_display = ('summary', 'customer', 'interaction_type', 'interaction_date', 'logged_by')
    list_filter = ('interaction_type', 'logged_by')
    search_fields = ('summary', 'details', 'customer__name')
