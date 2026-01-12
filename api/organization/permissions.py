from rest_framework.permissions import BasePermission

class IsOrganizationSet(BasePermission):
    message = "Organization not found or invalid organization context."
    def has_permission(self, request, view):
        return request.organization is not None