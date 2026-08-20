from django.contrib import admin
from .models import Opportunity


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'amount', 'stage', 'probability', 'assigned_to', 'expected_close_date')
    list_filter = ('stage', 'assigned_to')
    search_fields = ('title', 'customer__name')
