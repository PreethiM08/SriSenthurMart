from django.urls import path
from .views import (
    ProductListView, ProductDetailView,
    AdminProductListCreateView, AdminProductDetailView,
    add_stock, StockHistoryView
)

urlpatterns = [
    # Public
    path('', ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    # Admin
    path('admin/', AdminProductListCreateView.as_view(), name='admin-product-list'),
    path('admin/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/<int:pk>/add-stock/', add_stock, name='add-stock'),
    path('admin/<int:pk>/stock-history/', StockHistoryView.as_view(), name='stock-history'),
]