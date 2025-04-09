from django.db import models

class Deal(models.Model):
    # ...existing code...
    is_paid = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    payment_date = models.DateTimeField(blank=True, null=True)
    # ...existing code...