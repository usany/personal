from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def route(request):
    if request.path == "/route/":
        return Response({"message": "Welcome route"})
    return Response({"message": "Welcome!"})
