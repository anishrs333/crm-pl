from django.contrib import admin
from .models import Opportunity


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'customer',
        'amount',
        'stage',
        'probability',
        'weighted_amount_display',
        'assigned_to',
        'expected_close_date',
        'created_at'
    )
    list_filter = ('stage', 'assigned_to', 'expected_close_date')
    search_fields = ('title', 'customer__name', 'lost_reason')
    readonly_fields = ('actual_close_date', 'created_at', 'updated_at')

    @admin.display(description='Weighted Forecast')
    def weighted_amount_display(self, obj):
        return f"${obj.weighted_amount:,.2f}"