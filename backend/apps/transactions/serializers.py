from rest_framework import serializers
from .models import Transaction
from apps.orders.serializers import OrderSerializer


class TransactionSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.IntegerField(write_only=True)
    customer_name = serializers.CharField(source='user.full_name', read_only=True)
    customer_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'transaction_id', 'order', 'order_id',
            'user', 'customer_name', 'customer_username',
            'amount', 'payment_status', 'payment_date'
        )
        read_only_fields = ('id', 'transaction_id', 'user', 'payment_date')


class CreateTransactionSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()