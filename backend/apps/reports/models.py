from django.db import models
from django.conf import settings


class SavedReport(models.Model):
    class ReportType(models.TextChoices):
        LEAD_CONVERSION = 'lead_conversion', 'Lead Conversion Analytics'
        SALES_PIPELINE = 'sales_pipeline', 'Sales Pipeline & Revenue Forecast'
        EMPLOYEE_PERFORMANCE = 'employee_performance', 'Employee Performance Leaderboard'
        CUSTOMER_RETENTION = 'customer_retention', 'Customer Retention & Touchpoints'
        CUSTOM = 'custom', 'Custom Filtered Report'

    title = models.CharField(max_length=200, default='', blank=True, db_index=True)
    report_type = models.CharField(
        max_length=30,
        choices=ReportType.choices,
        default=ReportType.SALES_PIPELINE
    )
    description = models.TextField(blank=True, null=True)
    filters_json = models.JSONField(
        default=dict,
        blank=True,
        help_text="Saved filter parameters in JSON format"
    )
    is_public = models.BooleanField(
        default=False,
        help_text="If true, shared across all sales managers"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_reports'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_saved_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"



