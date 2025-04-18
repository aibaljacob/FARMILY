# Generated by Django 5.1.4 on 2025-03-24 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_chatroom_deal_type_message_is_read'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatroom',
            name='deal_id',
            field=models.IntegerField(),
        ),
        migrations.AlterUniqueTogether(
            name='chatroom',
            unique_together={('deal_id', 'deal_type')},
        ),
    ]
