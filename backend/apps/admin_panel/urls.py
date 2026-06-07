from django.urls import path
from .views import DashboardView, UsersListView, SalesAnalyticsView, RevenueAnalyticsView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='admin_dashboard'),
    path('users/', UsersListView.as_view(), name='admin_users'),
    path('sales/', SalesAnalyticsView.as_view(), name='admin_sales'),
    path('revenue/', RevenueAnalyticsView.as_view(), name='admin_revenue'),
]