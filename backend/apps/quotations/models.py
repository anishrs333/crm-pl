from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Quotation(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SENT = 'sent', 'Sent to Client'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'
        EXPIRED = 'expired', 'Expired'

    quote_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        editable=False
    )
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='quotations'
    )
    opportunity = models.ForeignKey(
        'opportunities.Opportunity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )

    valid_until = models.DateField(null=True, blank=True, db_index=True)
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        db_index=True
    )

    terms_and_conditions = models.TextField(
        blank=True,
        null=True,
        default=""
    )
    notes = models.TextField(blank=True, null=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_quotations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_quotations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quote_number} - {self.customer.name} (₹{self.grand_total:,.2f})"

    def recalculate_totals(self):
        items = self.items.all()
        subtotal = sum(item.line_subtotal for item in items)
        tax_amount = sum(item.line_tax for item in items)
        
        self.subtotal = subtotal
        self.tax_amount = tax_amount
        self.grand_total = subtotal + tax_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'grand_total'])


class QuotationItem(models.Model):
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quoted_items'
    )
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('18.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    class Meta:
        db_table = 'crm_quotation_items'

    def __str__(self):
        return f"{self.description} (x{self.quantity})"

    @property
    def line_subtotal(self):
        return (Decimal(self.quantity) * self.unit_price).quantize(Decimal('0.01'))

    @property
    def line_tax(self):
        return (self.line_subtotal * (self.tax_percentage / Decimal('100.00'))).quantize(Decimal('0.01'))

    @property
    def line_total(self):
        return self.line_subtotal + self.line_tax
