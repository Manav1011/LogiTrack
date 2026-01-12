from django.urls import path
from .views import list_branches, organization_login, branch_login

urlpatterns = [
    path('login/', organization_login, name='organization_login'),
    path('branch/login/', branch_login, name='branch_login'),
    path('branches/', list_branches, name='list_branches'),
]
