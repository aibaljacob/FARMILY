# Generated by Django 5.1.4 on 2025-03-19 16:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_product_can_deliver_product_unit_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='quantity',
            field=models.DecimalField(decimal_places=2, default=1.0, help_text='Amount/quantity of product (e.g. 5 kg, 10 pieces)', max_digits=10),
        ),
    ]
