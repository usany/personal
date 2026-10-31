"""URL configuration for route project."""
from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('route/', views.route, name='route'),
    path('', views.route, name='home'),
]
