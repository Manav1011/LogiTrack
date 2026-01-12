from organization.models import Organization

class OrganizationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]
        subdomain = host.split('.')[0]
        organization = None
        try:
            organization = Organization.objects.get(subdomain=subdomain)
            request.organization = organization
        except Organization.DoesNotExist:
            request.organization = None
        response = self.get_response(request)
        if organization:
            response.set_cookie('organization_slug', organization.slug)
        return response