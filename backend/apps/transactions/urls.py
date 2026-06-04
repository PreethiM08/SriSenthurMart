from django.urls import path
from .views import (
    CreateTransactionView, UserTransactionListView,
    UserTransactionDetailView, AdminTransactionListView
)

urlpatterns = [
    path('', UserTransactionListView.as_view(), name='transaction-list'),
    path('pay/', CreateTransactionView.as_view(), name='transaction-create'),
    path('<int:pk>/', UserTransactionDetailView.as_view(), name='transaction-detail'),
    path('admin/', AdminTransactionListView.as_view(), name='admin-transaction-list'),
]