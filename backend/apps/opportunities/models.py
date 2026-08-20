from django.db import models
from django.conf import settings


class Opportunity(models.Model):
    STAGE_CHOICES = (
        ('discovery', 'Discovery'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'In Negotiation'),
        ('won', 'Closed Won'),
        ('lost', 'Closed Lost'),
    )

    title = models.CharField(max_length=200)
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='opportunities',
        null=True,
        blank=True
    )
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.SET_NULL,
        related_name='opportunities',
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='discovery')
    probability = models.PositiveIntegerField(default=10, help_text="Estimated win probability percentage (0-100)")
    expected_close_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='opportunities'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (${self.amount})"
