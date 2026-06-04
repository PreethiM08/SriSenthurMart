from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction
from .serializers import TransactionSerializer, CreateTransactionSerializer
from apps.orders.models import Order


class CreateTransactionView(APIView):
    """Mock payment: create a transaction for an order."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_id = serializer.validated_data['order_id']

        try:
            order = Order.objects.get(pk=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(order, 'transaction'):
            return Response({'error': 'Payment already processed for this order.'}, status=status.HTTP_400_BAD_REQUEST)

        transaction = Transaction.objects.create(
            order=order,
            user=request.user,
            amount=order.total_amount,
            payment_status='success'
        )
        # Move order to processing after payment
        order.status = 'processing'
        order.save()

        return Response({
            'message': 'Payment successful!',
            'transaction': TransactionSerializer(transaction).data
        }, status=status.HTTP_201_CREATED)


class UserTransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('order')


class UserTransactionDetailView(generics.RetrieveAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


# Admin
class AdminTransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['payment_status']

    def get_queryset(self):
        qs = Transaction.objects.all().select_related('user', 'order')
        period = self.request.query_params.get('period')
        if period:
            now = timezone.now()
            if period == 'daily':
                qs = qs.filter(payment_date__date=now.date())
            elif period == 'weekly':
                from datetime import timedelta
                qs = qs.filter(payment_date__gte=now - timedelta(days=7))
            elif period == 'monthly':
                qs = qs.filter(
                    payment_date__year=now.year,
                    payment_date__month=now.month
                )
        return qs