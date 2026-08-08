from django.db import models
from django.contrib.auth.models import AbstractUser

# --- AUTH & PROFILES ---
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('VENDOR', 'Vendor'),
        ('CUSTOMER', 'Customer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CUSTOMER')

class VendorProfile(models.Model):  # Fixed inheritance to models.Model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    company_name = models.CharField(max_length=255)
    company_logo = models.FileField(upload_to='vendor_logos/', blank=True, null=True)
    gst_in = models.CharField(max_length=15)
    late_fee_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class QuotationTemplate(models.Model):
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'VENDOR'})
    name = models.CharField(max_length=255)
    validity_days = models.PositiveIntegerField(default=30)
    payment_terms_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)

# --- GLOBAL ATTRIBUTES ---
class ProductAttribute(models.Model):
    DISPLAY_CHOICES = (
        ('RADIO', 'Radio'),
        ('PILLS', 'Pills'),
        ('CHECKBOX', 'Check Box'),
        ('IMAGE', 'Image'),
    )
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'VENDOR'})
    name = models.CharField(max_length=255)
    display_type = models.CharField(max_length=20, choices=DISPLAY_CHOICES, default='RADIO')

    def __str__(self):
        return self.name

class ProductAttributeValue(models.Model):
    attribute = models.ForeignKey(ProductAttribute, related_name='values', on_delete=models.CASCADE)
    value = models.CharField(max_length=255)
    default_extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"

# --- PRODUCTS, INVENTORY & PRICING ---
class Product(models.Model):
    TYPE_CHOICES = (
        ('GOODS', 'Goods'),
        ('SERVICE', 'Service'), 
    )
    PERIODICITY_CHOICES = (
        ('HOURS', 'Hours'),
        ('DAY', 'Day'),
        ('NIGHT', 'Night'),
        ('WEEKLY', 'Weekly'),
    )
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'VENDOR'})
    name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='GOODS')
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    sales_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    periodicity = models.CharField(max_length=10, choices=PERIODICITY_CHOICES, default='DAY')
    is_published = models.BooleanField(default=False)

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    attribute_value = models.ForeignKey(ProductAttributeValue, on_delete=models.CASCADE)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class Pricelist(models.Model):
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'VENDOR'})
    name = models.CharField(max_length=255)

class PricelistRule(models.Model):
    PRICE_TYPE_CHOICES = (
        ('DISCOUNT', 'Discount'),
        ('FIXED', 'Fixed Price'),
    )
    pricelist = models.ForeignKey(Pricelist, related_name='rules', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, blank=True, null=True)
    price_type = models.CharField(max_length=10, choices=PRICE_TYPE_CHOICES, default='DISCOUNT')
    fixed_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    min_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    validity_start = models.DateTimeField(blank=True, null=True)
    validity_end = models.DateTimeField(blank=True, null=True)

class Wishlist(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField(Product, blank=True)

# --- CART & ORDER LIFECYCLE ---
class Cart(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    rental_start_date = models.DateTimeField()
    rental_end_date = models.DateTimeField()

class RentalOrder(models.Model):
    STATUS_CHOICES = (
        ('QUOTATION', 'Quotation'),
        ('QUOTATION_SENT', 'Quotation Sent'),
        ('SALE_ORDER', 'Sale Order'),
    )
    LOGISTICS_CHOICES = (
        ('TODAY', 'Today'),
        ('PICKUP', 'Pickup'),
        ('RETURN', 'Return'),
        ('LATE', 'Late'),
    )
    customer = models.ForeignKey(User, related_name='customer_orders', on_delete=models.CASCADE)
    vendor = models.ForeignKey(User, related_name='vendor_orders', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUOTATION')
    logistics_status = models.CharField(max_length=20, choices=LOGISTICS_CHOICES, default='TODAY')
    rental_start_date = models.DateTimeField()
    rental_end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

class OrderLineItem(models.Model):
    order = models.ForeignKey(RentalOrder, related_name='lines', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

# --- BILLING & INVOICE ---
class Invoice(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('POSTED', 'Posted'),
    )
    order = models.OneToOneField(RentalOrder, related_name='invoice', on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    billing_address = models.TextField()
    delivery_address = models.TextField()
    delivery_method = models.CharField(max_length=50, default='Standard Delivery')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=20, default='Pending')
