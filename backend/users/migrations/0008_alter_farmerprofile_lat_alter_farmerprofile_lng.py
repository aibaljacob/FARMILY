# Generated by Django 5.1.4 on 2025-02-22 21:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_remove_farmerprofile_district'),
    ]

    operations = [
        migrations.AlterField(
            model_name='farmerprofile',
            name='lat',
            field=models.DecimalField(blank=True, decimal_places=11, max_digits=15, null=True),
        ),
        migrations.AlterField(
            model_name='farmerprofile',
            name='lng',
            field=models.DecimalField(blank=True, decimal_places=11, max_digits=15, null=True),
        ),
    ]
