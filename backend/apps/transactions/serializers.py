from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'transaction_id', 'order_id', 'user_name',
            'amount', 'payment_status', 'payment_date'
        )
        read_only_fields = ('id', 'payment_date', 'user_name', 'order_id')


class CreateTransactionSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    transaction_id = serializers.CharField(max_length=100)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_status = serializers.ChoiceField(choices=['success', 'failed', 'pending'])