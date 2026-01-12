from rest_framework.response import Response
from rest_framework.views import exception_handler
import time
import uuid
import random
import string
import re
from rest_framework import status

def response(status_code, message, data=None, error=None):
    resp = {
        'status_code': status_code,
        'message': message,
        'data': data,
        'error': error,
    }
    return Response(resp, status=status_code)

def is_valid_email(email):
    # RFC 5322 compliant regex
    email_regex = re.compile(
        r"^(?!\.)"                            
        r"[-!#$%&'*+/=?^_`{|}~\w]+"           
        r"(?:\.[-!#$%&'*+/=?^_`{|}~\w]+)*"    
        r"(?<!\.)"                            
        r"@"                                  
        r"(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}"
        r"|\[(?:\d{1,3}\.){3}\d{1,3}\])$"     
    )
    
    return re.match(email_regex, email) is not None

def generate_unique_hash():
    """
    Generates a more robust unique slug using a larger portion of UUID and timestamp.
    """
    # Use a larger part of UUID (32 characters) and append a timestamp for uniqueness
    random_hash = str(uuid.uuid4().hex)[:16]  # Using 16 characters from the UUID
    timestamp = str(int(time.time() * 1000))  # Millisecond precision timestamp
    
    # Combine UUID and timestamp for a more robust unique hash
    unique_hash = f"{random_hash}_{timestamp}"
    
    return unique_hash


def custom_exception_handler(exc, context):
    resp = exception_handler(exc, context)
    if resp is not None:
        # Convert error data to plain dict/string if needed
        error_data = resp.data
        if hasattr(error_data, '__dict__'):
            error_data = str(error_data)
        return response(
            status_code=resp.status_code,
            message="",
            data=None,
            error=error_data
        )
    return response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Unexpected error occurred.",
        data=None,
        error=str(exc)
    )