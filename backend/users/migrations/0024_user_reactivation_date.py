# Generated by Django 5.1.4 on 2025-04-02 05:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0023_favoritedemand_favoriteproduct'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='reactivation_date',
            field=models.DateTimeField(blank=True, help_text='Date when a deactivated user should be reactivated', null=True),
        ),
    ]
