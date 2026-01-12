from rest_framework.routers import DefaultRouter
from .views import UserViewSet, signup, SessionLoginView, SessionLogoutView
from django.urls import path, include
from django.contrib.auth import views as auth_views

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	path('signup/', signup, name='signup'),
  	path('login/', SessionLoginView.as_view(), name='login'),
    path('logout/', SessionLogoutView.as_view(), name='logout'),
	path('', include(router.urls)),
]
