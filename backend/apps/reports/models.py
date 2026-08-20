from django.db import models
from django.conf import settings


class SavedReport(models.Model):
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, help_text="e.g. sales_pipeline, lead_conversion, revenue")
    parameters = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.report_type})"
