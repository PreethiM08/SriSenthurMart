from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import timedelta
from .models import Transaction
from .serializers import TransactionSerializer, CreateTransactionSerializer
from apps.orders.models import Order


class CreateTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        try:
            order = Order.objects.get(pk=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(order, 'transaction'):
            return Response({'error': 'Transaction already exists for this order'}, status=status.HTTP_400_BAD_REQUEST)

        transaction = Transaction.objects.create(
            transaction_id=serializer.validated_data['transaction_id'],
            order=order,
            user=request.user,
            amount=serializer.validated_data['amount'],
            payment_status=serializer.validated_data['payment_status']
        )

        # Update order status after successful payment
        if transaction.payment_status == 'success':
            order.status = 'processing'
            order.save()

        return Response(
            TransactionSerializer(transaction).data,
            status=status.HTTP_201_CREATED
        )


class UserTransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class AdminTransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = Transaction.objects.all().select_related('user', 'order')
        filter_type = self.request.query_params.get('filter', 'all')
        now = timezone.now()

        if filter_type == 'daily':
            qs = qs.filter(payment_date__date=now.date())
        elif filter_type == 'weekly':
            qs = qs.filter(payment_date__gte=now - timedelta(days=7))
        elif filter_type == 'monthly':
            qs = qs.filter(payment_date__year=now.year, payment_date__month=now.month)

        return qs