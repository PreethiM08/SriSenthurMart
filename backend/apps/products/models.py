from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('oil', 'Oil Products'),
        ('powder', 'Powder Mix Products'),
    ]
    UNIT_CHOICES = [
        ('liter', 'Liter'),
        ('kg', 'Kg'),
        ('gram', 'Gram'),
    ]
    

    product_name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_value = models.DecimalField(max_digits=10, decimal_places=3)
    quantity_unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    product_count = models.PositiveIntegerField(default=0)  # stock
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return self.product_name

    @property
    def is_out_of_stock(self):
        return self.product_count <= 0


class StockHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_history')
    previous_stock = models.PositiveIntegerField()
    added_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_history'
        ordering = ['-created_at']