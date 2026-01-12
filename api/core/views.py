
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, logout

from core.models import User
from core.serializers import UserSerializer, RegisterSerializer, BaseResponseSerializer
from rest_framework import serializers
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

from core.utils import response
from rest_framework.permissions import IsAuthenticated


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@swagger_auto_schema(method='post', request_body=RegisterSerializer, responses={201: BaseResponseSerializer}, tags=['users'])
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return response(
            status.HTTP_201_CREATED,
            "User created successfully.",
            data=UserSerializer(user).data,
            error=None
        )
    return response(
        status.HTTP_400_BAD_REQUEST,
        "User creation failed.",
        data=None,
        error=serializer.errors
    )



from drf_yasg.utils import swagger_auto_schema

class SessionLoginView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=LoginSerializer, tags=["auth"])
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return response(status.HTTP_400_BAD_REQUEST, "Invalid input", error=serializer.errors)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return response(status.HTTP_200_OK, "Login successful")
        return response(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

class SessionLogoutView(APIView):
    def post(self, request):
        logout(request)
        return response(status.HTTP_200_OK, "Logout successful")