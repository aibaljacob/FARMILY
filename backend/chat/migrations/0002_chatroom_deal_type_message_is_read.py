# Generated by Django 5.1.4 on 2025-03-24 16:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatroom',
            name='deal_type',
            field=models.CharField(choices=[('product_offer', 'Product Offer'), ('demand_response', 'Demand Response')], default=0, max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='message',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
    ]
