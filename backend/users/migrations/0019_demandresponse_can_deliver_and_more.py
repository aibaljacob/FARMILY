# Generated by Django 5.1.4 on 2025-03-24 06:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_productoffer'),
    ]

    operations = [
        migrations.AddField(
            model_name='demandresponse',
            name='can_deliver',
            field=models.BooleanField(default=False, help_text='Whether the farmer can deliver this product to the buyer'),
        ),
        migrations.AddField(
            model_name='demandresponse',
            name='delivery_status',
            field=models.CharField(blank=True, default='ready', help_text='Current delivery status if delivery is available', max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='productoffer',
            name='delivery_status',
            field=models.CharField(blank=True, default='ready', help_text='Current delivery status if delivery is available', max_length=20, null=True),
        ),
    ]
