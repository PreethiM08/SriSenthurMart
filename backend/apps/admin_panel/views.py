from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import User
from apps.products.models import Product
from apps.orders.models import Order, OrderItem
from apps.transactions.models import Transaction


class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(is_staff=False).count()
        total_products = Product.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        total_transactions = Transaction.objects.filter(payment_status='success').count()

        total_revenue = Transaction.objects.filter(
            payment_status='success'
        ).aggregate(total=Sum('amount'))['total'] or 0

        products_sold = OrderItem.objects.aggregate(
            total=Sum('quantity')
        )['total'] or 0

        low_stock_products = Product.objects.filter(
            is_active=True, stock__gt=0, stock__lte=10
        ).values('id', 'product_name', 'stock')[:10]

        out_of_stock_products = Product.objects.filter(
            is_active=True, stock=0
        ).values('id', 'product_name', 'stock')[:10]

        low_stock_all = list(low_stock_products) + list(out_of_stock_products)

        # Top products by sales
        top_products = OrderItem.objects.values(
            'product_name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('unit_price')
        ).order_by('-total_sold')[:5]

        # Monthly revenue (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_sales = Transaction.objects.filter(
            payment_status='success',
            payment_date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(
            revenue=Sum('amount')
        ).order_by('month')

        monthly_data = [
            {
                'month': entry['month'].strftime('%b %Y'),
                'revenue': float(entry['revenue'])
            }
            for entry in monthly_sales
        ]

        oil_count = Product.objects.filter(category='oil', is_active=True).count()
        powder_count = Product.objects.filter(category='powder', is_active=True).count()

        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_transactions': total_transactions,
            'total_revenue': float(total_revenue),
            'products_sold': products_sold,
            'low_stock_count': Product.objects.filter(is_active=True, stock__gt=0, stock__lte=10).count(),
            'out_of_stock_count': Product.objects.filter(is_active=True, stock=0).count(),
            'low_stock_products': low_stock_all,
            'top_products': list(top_products),
            'monthly_sales': monthly_data,
            'oil_products_count': oil_count,
            'powder_products_count': powder_count,
        })


class UsersListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from apps.accounts.serializers import UserSerializer
        users = User.objects.filter(is_staff=False).order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class SalesAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        now = timezone.now()

        if period == 'daily':
            start = now - timedelta(days=30)
        elif period == 'weekly':
            start = now - timedelta(weeks=12)
        else:
            start = now - timedelta(days=365)

        transactions = Transaction.objects.filter(
            payment_status='success',
            payment_date__gte=start
        ).annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(
            count=Count('id'),
            revenue=Sum('amount')
        ).order_by('month')

        return Response(list(transactions))


class RevenueAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total = Transaction.objects.filter(payment_status='success').aggregate(
            total=Sum('amount')
        )['total'] or 0

        by_category = OrderItem.objects.select_related('product').values(
            'product__category'
        ).annotate(
            total_sold=Sum('quantity'),
            revenue=Sum('unit_price')
        )

        return Response({
            'total_revenue': float(total),
            'by_category': list(by_category)
        })