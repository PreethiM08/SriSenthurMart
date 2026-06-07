from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.users.models import User
from apps.products.models import Product


class Command(BaseCommand):
    help = 'Seed database with sample products and admin user'

    def handle(self, *args, **kwargs):
        # Create admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create(
                username='admin',
                email='admin@srisenthurmart.com',
                full_name='Admin User',
                phone_number='9876543210',
                password=make_password('Admin@1234'),
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write(self.style.SUCCESS('✓ Admin user created: admin / Admin@1234'))
        else:
            self.stdout.write('Admin user already exists.')

        # Create test user
        if not User.objects.filter(username='testuser').exists():
            User.objects.create(
                username='testuser',
                email='test@srisenthurmart.com',
                full_name='Test User',
                phone_number='9876543211',
                password=make_password('Test@1234'),
            )
            self.stdout.write(self.style.SUCCESS('✓ Test user created: testuser / Test@1234'))

        # Oil products
        oil_products = [
            {'product_name': 'Groundnut Oil', 'price': 250.00, 'quantity_value': 1.0, 'quantity_unit': 'liter', 'product_count': 100},
            {'product_name': 'Sesame Oil', 'price': 380.00, 'quantity_value': 500, 'quantity_unit': 'gram', 'product_count': 75},
            {'product_name': 'Coconut Oil', 'price': 320.00, 'quantity_value': 1.0, 'quantity_unit': 'liter', 'product_count': 60},
            {'product_name': 'Mustard Oil', 'price': 210.00, 'quantity_value': 1.0, 'quantity_unit': 'liter', 'product_count': 90},
            {'product_name': 'Castor Oil', 'price': 180.00, 'quantity_value': 500, 'quantity_unit': 'gram', 'product_count': 5},
        ]

        # Powder products
        powder_products = [
            {'product_name': 'Idli Mix', 'price': 150.00, 'quantity_value': 500, 'quantity_unit': 'gram', 'product_count': 80},
            {'product_name': 'Dosa Mix', 'price': 130.00, 'quantity_value': 500, 'quantity_unit': 'gram',  'product_count': 70},
            {'product_name': 'Health Mix', 'price': 220.00, 'quantity_value': 1.0, 'quantity_unit': 'kg', 'product_count': 0},
            {'product_name': 'Ragi Flour', 'price': 95.00, 'quantity_value': 500, 'quantity_unit': 'gram', 'product_count': 120},
            {'product_name': 'Wheat Rava Mix', 'price': 110.00, 'quantity_value': 500, 'quantity_unit': 'gram', 'product_count': 55},
        ]

        created = 0
        for p_data in oil_products:
            if not Product.objects.filter(product_name=p_data['product_name']).exists():
                Product.objects.create(category='oil', **p_data)
                created += 1

        for p_data in powder_products:
            if not Product.objects.filter(product_name=p_data['product_name']).exists():
                Product.objects.create(category='powder', **p_data)
                created += 1

        self.stdout.write(self.style.SUCCESS(f'✓ {created} products seeded successfully'))
        self.stdout.write(self.style.SUCCESS('\n SriSenthurMart seed complete!'))
        self.stdout.write('  Admin login → admin / Admin@1234')
        self.stdout.write('  User login  → testuser / Test@1234')