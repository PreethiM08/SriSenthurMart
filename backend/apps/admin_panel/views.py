from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User
from apps.products.models import Product
from apps.orders.models import Order, OrderItem
from apps.transactions.models import Transaction


class DashboardSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(is_staff=False).count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_transactions = Transaction.objects.count()
        total_revenue = Transaction.objects.filter(
            payment_status='success'
        ).aggregate(total=Sum('amount'))['total'] or 0

        products_sold = OrderItem.objects.aggregate(
            total=Sum('quantity')
        )['total'] or 0

        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_transactions': total_transactions,
            'total_revenue': float(total_revenue),
            'products_sold': products_sold,
        })


class SalesOverviewView(APIView):
    """Monthly sales data for chart (last 6 months)."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        six_months_ago = timezone.now() - timedelta(days=180)
        data = (
            Transaction.objects
            .filter(payment_date__gte=six_months_ago, payment_status='success')
            .annotate(month=TruncMonth('payment_date'))
            .values('month')
            .annotate(revenue=Sum('amount'), orders=Count('id'))
            .order_by('month')
        )
        return Response([
            {
                'month': item['month'].strftime('%b %Y'),
                'revenue': float(item['revenue']),
                'orders': item['orders'],
            }
            for item in data
        ])


class ProductSalesSummaryView(APIView):
    """Top 10 products by quantity sold."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = (
            OrderItem.objects
            .values('product_name')
            .annotate(total_sold=Sum('quantity'), revenue=Sum(F('quantity') * F('unit_price')))
            .order_by('-total_sold')[:10]
        )
        return Response(list(data))


class LowStockView(APIView):
    """Products with stock <= 10."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.products.serializers import ProductSerializer
        low_stock = Product.objects.filter(product_count__lte=10, is_active=True).order_by('product_count')
        from apps.products.serializers import ProductSerializer
        serializer = ProductSerializer(low_stock, many=True, context={'request': request})
        return Response(serializer.data)


class RevenueAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        top_product = (
            OrderItem.objects
            .values('product_name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')
            .first()
        )
        out_of_stock = Product.objects.filter(product_count=0).count()
        low_stock = Product.objects.filter(product_count__gt=0, product_count__lte=10).count()
        total_revenue = Transaction.objects.filter(
            payment_status='success'
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'total_revenue': float(total_revenue),
            'top_selling_product': top_product,
            'out_of_stock_count': out_of_stock,
            'low_stock_count': low_stock,
            'total_products_sold': OrderItem.objects.aggregate(t=Sum('quantity'))['t'] or 0,
        })