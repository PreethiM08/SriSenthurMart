from django.urls import path
from .views import (
    CreateOrderView, UserOrderListView, UserOrderDetailView,
    AdminOrderListView, AdminOrderDetailView
)

urlpatterns = [
    path('', UserOrderListView.as_view(), name='order-list'),
    path('create/', CreateOrderView.as_view(), name='order-create'),
    path('<int:pk>/', UserOrderDetailView.as_view(), name='order-detail'),
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
]