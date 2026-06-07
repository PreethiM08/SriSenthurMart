from django.db import models
from apps.accounts.models import User
from apps.orders.models import Order


class Transaction(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]

    transaction_id = models.CharField(max_length=100, unique=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='transaction')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.transaction_id} — ₹{self.amount}"