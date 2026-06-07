from django.urls import path
from .views import CreateTransactionView, UserTransactionListView, AdminTransactionListView

urlpatterns = [
    path('', CreateTransactionView.as_view(), name='create_transaction'),
    path('my/', UserTransactionListView.as_view(), name='user_transactions'),
    path('admin/', AdminTransactionListView.as_view(), name='admin_transactions'),
]