from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator


class Product(models.Model):
    class ProductType(models.TextChoices):
        PHYSICAL = 'product', 'Physical Product'
        SERVICE = 'service', 'Service / Subscription'

    class Category(models.TextChoices):
        SOFTWARE = 'software', 'Software & Licenses'
        HARDWARE = 'hardware', 'Hardware & Equipment'
        SERVICE = 'service', 'Professional Services'
        SUBSCRIPTION = 'subscription', 'Recurring Subscription'
        MAINTENANCE = 'maintenance', 'Support & Maintenance'
        OTHER = 'other', 'Other'

    sku = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="Product Code / SKU"
    )
    name = models.CharField(max_length=200, db_index=True)
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.PHYSICAL
    )
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.SOFTWARE
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Base selling price before tax"
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('18.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="GST / Tax percentage (e.g. 18.00)"
    )
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_products'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def price_with_tax(self):
        tax_multiplier = Decimal('1.00') + (self.tax_percentage / Decimal('100.00'))
        return (self.unit_price * tax_multiplier).quantize(Decimal('0.01'))