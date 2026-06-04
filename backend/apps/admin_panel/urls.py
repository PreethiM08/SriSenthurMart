from django.urls import path
from .views import (
    DashboardSummaryView, SalesOverviewView,
    ProductSalesSummaryView, LowStockView, RevenueAnalyticsView
)

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('sales-overview/', SalesOverviewView.as_view(), name='sales-overview'),
    path('product-sales/', ProductSalesSummaryView.as_view(), name='product-sales-summary'),
    path('low-stock/', LowStockView.as_view(), name='low-stock'),
    path('revenue/', RevenueAnalyticsView.as_view(), name='revenue-analytics'),
]