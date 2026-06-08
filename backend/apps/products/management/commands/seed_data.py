from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.users.models import User
from apps.products.models import Product


class Command(BaseCommand):
    help = 'Seed database with real products and admin/test users'

    def handle(self, *args, **kwargs):

        # ── Admin user ──────────────────────────────────────────────────────
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
            self.stdout.write('  Admin already exists, skipping.')

        # ── Test customer ────────────────────────────────────────────────────
        if not User.objects.filter(username='testuser').exists():
            User.objects.create(
                username='testuser',
                email='test@srisenthurmart.com',
                full_name='Test User',
                phone_number='9876543211',
                password=make_password('Test@1234'),
            )
            self.stdout.write(self.style.SUCCESS('✓ Test user created: testuser / Test@1234'))
        else:
            self.stdout.write('  Test user already exists, skipping.')

        # ── Products ─────────────────────────────────────────────────────────
        # Each tuple: (product_name, category, price, stock, quantity_value, quantity_unit)
        products = [
            # ── Oil Products (18 items) ──────────────────────────────────────
            ('Coconut Oil',         'oil',    400.00, 20, 1,   'liter'),
            ('Coconut Oil',         'oil',    200.00, 19, 500, 'gram'),
            ('Sesame Oil',          'oil',    340.00, 14, 1,   'liter'),
            ('Sesame Oil',          'oil',    170.00, 16, 500, 'gram'),
            ('Groundnut Oil',       'oil',    220.00, 16, 1,   'liter'),
            ('Groundnut Oil',       'oil',    110.00, 19, 500, 'gram'),
            ('Deepam Oil',          'oil',    190.00, 20, 1,   'liter'),
            ('Deepam Oil',          'oil',     95.00, 17, 500, 'gram'),
            ('Castor Oil',          'oil',    250.00, 20, 1,   'liter'),
            ('Castor Oil',          'oil',    125.00, 20, 500, 'gram'),
            ('Butter Tree Oil',     'oil',    250.00, 20, 1,   'liter'),
            ('Butter Tree Oil',     'oil',    125.00, 20, 500, 'gram'),
            ('Pongamia Oil',        'oil',    260.00, 20, 1,   'liter'),
            ('Pongamia Oil',        'oil',    130.00, 20, 500, 'gram'),
            ('Neem Oil',            'oil',    500.00, 20, 1,   'liter'),
            ('Neem Oil',            'oil',    250.00, 20, 500, 'gram'),
            ('Ghee',                'oil',    750.00, 20, 1,   'kg'),
            ('Ghee',                'oil',    350.00, 18, 500, 'gram'),

            # ── Dry Spice Mix / Powder Products (7 items) ───────────────────
            ('Idly Powder',         'powder',  45.00, 20, 100, 'gram'),
            ('Groundnut Powder',    'powder',  45.00, 20, 500, 'gram'),
            ('Chili Idly Powder',   'powder',  45.00, 18, 500, 'gram'),
            ('Sesame Powder',       'powder',  45.00, 15, 500, 'gram'),
            ('Garlic Powder',       'powder',  45.00, 20, 500, 'gram'),
            ('Curry Powder',        'powder',  45.00, 16, 500, 'gram'),
            ('Moringa Leaf Powder', 'powder',  45.00, 16, 500, 'gram'),
        ]

        created = 0
        skipped = 0
        for name, category, price, stock, qty_value, qty_unit in products:
            exists = Product.objects.filter(
                product_name=name,
                quantity_value=qty_value,
                quantity_unit=qty_unit,
            ).exists()
            if not exists:
                Product.objects.create(
                    product_name=name,
                    category=category,
                    price=price,
                    stock=stock,
                    quantity_value=qty_value,
                    quantity_unit=qty_unit,
                    product_count=1,
                    is_active=True,
                )
                created += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'✓ {created} products created, {skipped} already existed'
        ))
        self.stdout.write(self.style.SUCCESS('\n🌿 SriSenthurMart seed complete!'))
        self.stdout.write('   Admin login  →  admin / Admin@1234')
        self.stdout.write('   User login   →  testuser / Test@1234')
