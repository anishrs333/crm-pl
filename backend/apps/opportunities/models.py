from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Opportunity(models.Model):
    class Stage(models.TextChoices):
        DISCOVERY = 'discovery', 'Discovery & Needs Analysis'
        PROPOSAL = 'proposal', 'Proposal / Quote Sent'
        NEGOTIATION = 'negotiation', 'In Negotiation'
        WON = 'won', 'Closed Won'
        LOST = 'lost', 'Closed Lost'

    STAGE_PROBABILITY_MAP = {
        Stage.DISCOVERY: 20,
        Stage.PROPOSAL: 40,
        Stage.NEGOTIATION: 70,
        Stage.WON: 100,
        Stage.LOST: 0,
    }

    title = models.CharField(max_length=200, db_index=True)
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
        null=True,
        blank=True,
        related_name='opportunities'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        db_index=True
    )
    stage = models.CharField(
        max_length=30,
        choices=Stage.choices,
        default=Stage.DISCOVERY,
        db_index=True
    )
    probability = models.PositiveIntegerField(
        default=20,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Estimated win probability percentage (0-100)"
    )
    expected_close_date = models.DateField(null=True, blank=True, db_index=True)
    actual_close_date = models.DateTimeField(null=True, blank=True)
    lost_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Required when stage is changed to Closed Lost"
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_opportunities'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_opportunities'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_opportunities'
        ordering = ['-created_at']
        verbose_name = 'Opportunity'
        verbose_name_plural = 'Opportunities'

    def __str__(self):
        return f"{self.title} - ${self.amount:,.2f} ({self.get_stage_display()})"

    @property
    def weighted_amount(self):
        """Calculates expected forecast value based on win probability."""
        if not self.amount or not self.probability:
            return Decimal('0.00')
        return (self.amount * (Decimal(self.probability) / Decimal('100.00'))).quantize(Decimal('0.01'))

    def save(self, *args, **kwargs):
        if self.stage in self.STAGE_PROBABILITY_MAP and not kwargs.get('update_fields'):
            if self._state.adding or 'stage' in kwargs.get('update_fields', []):
                self.probability = self.STAGE_PROBABILITY_MAP[self.stage]
        super().save(*args, **kwargs)