from core.models import BaseModel
from django.db import models
from django.contrib.auth.hashers import make_password, check_password

# Create your models here.

class Organization(BaseModel):
    title = models.CharField(max_length=100)
    subdomain = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    password = models.CharField(max_length=128)
    
    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return self.title

class Branch(BaseModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='branches')
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    password = models.CharField(max_length=128)
    
    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return f"{self.title} - {self.organization.title}"