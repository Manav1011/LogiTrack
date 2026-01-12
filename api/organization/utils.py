from .models import Organization, Branch

def authenticate_organization(org_id_or_slug, password):
	try:
		org = Organization.objects.get(id=org_id_or_slug) if str(org_id_or_slug).isdigit() else Organization.objects.get(slug=org_id_or_slug)
	except Organization.DoesNotExist:
		return None
	if org.check_password(password):
		return org
	return None

def authenticate_branch(branch_id_or_slug, password):
	try:
		branch = Branch.objects.get(id=branch_id_or_slug) if str(branch_id_or_slug).isdigit() else Branch.objects.get(slug=branch_id_or_slug)
	except Branch.DoesNotExist:
		return None
	if branch.check_password(password):
		return branch
	return None
