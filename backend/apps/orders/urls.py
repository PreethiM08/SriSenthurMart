from django.urls import path
from .views import (
    CreateOrderView, UserOrderListView, UserOrderDetailView,
    AdminOrderListView, AdminOrderDetailView, CancelOrderView
)

urlpatterns = [
    path('', UserOrderListView.as_view(), name='order-list'),
    path('create/', CreateOrderView.as_view(), name='order-create'),
    path('<int:pk>/', UserOrderDetailView.as_view(), name='order-detail'),
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='cancel_order'),
]