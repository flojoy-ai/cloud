# openapi_client.WorkspaceApi

All URIs are relative to *http://localhost:3000/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**workspace_delete_workspace_by_id**](WorkspaceApi.md#workspace_delete_workspace_by_id) | **DELETE** /v1/workspaces/{workspaceId} | 
[**workspace_get_all_workspaces**](WorkspaceApi.md#workspace_get_all_workspaces) | **GET** /v1/workspaces | 
[**workspace_get_workspace_by_id**](WorkspaceApi.md#workspace_get_workspace_by_id) | **GET** /v1/workspaces/{workspaceId} | 
[**workspace_update_workspace**](WorkspaceApi.md#workspace_update_workspace) | **PATCH** /v1/workspaces/{workspaceId} | 


# **workspace_delete_workspace_by_id**
> object workspace_delete_workspace_by_id(workspace_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000/api"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.WorkspaceApi(api_client)
    workspace_id = 'workspace_id_example' # str | 

    try:
        api_response = api_instance.workspace_delete_workspace_by_id(workspace_id)
        print("The response of WorkspaceApi->workspace_delete_workspace_by_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WorkspaceApi->workspace_delete_workspace_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **workspace_id** | **str**|  | 

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**0** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **workspace_get_all_workspaces**
> List[WorkspaceGetWorkspaceById200Response] workspace_get_all_workspaces()



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.workspace_get_workspace_by_id200_response import WorkspaceGetWorkspaceById200Response
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000/api"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.WorkspaceApi(api_client)

    try:
        api_response = api_instance.workspace_get_all_workspaces()
        print("The response of WorkspaceApi->workspace_get_all_workspaces:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WorkspaceApi->workspace_get_all_workspaces: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[WorkspaceGetWorkspaceById200Response]**](WorkspaceGetWorkspaceById200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**0** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **workspace_get_workspace_by_id**
> WorkspaceGetWorkspaceById200Response workspace_get_workspace_by_id(workspace_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.workspace_get_workspace_by_id200_response import WorkspaceGetWorkspaceById200Response
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000/api"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.WorkspaceApi(api_client)
    workspace_id = 'workspace_id_example' # str | 

    try:
        api_response = api_instance.workspace_get_workspace_by_id(workspace_id)
        print("The response of WorkspaceApi->workspace_get_workspace_by_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WorkspaceApi->workspace_get_workspace_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **workspace_id** | **str**|  | 

### Return type

[**WorkspaceGetWorkspaceById200Response**](WorkspaceGetWorkspaceById200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**0** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **workspace_update_workspace**
> object workspace_update_workspace(workspace_id, workspace_update_workspace_request)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.workspace_update_workspace_request import WorkspaceUpdateWorkspaceRequest
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000/api
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000/api"
)


# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.WorkspaceApi(api_client)
    workspace_id = 'workspace_id_example' # str | 
    workspace_update_workspace_request = openapi_client.WorkspaceUpdateWorkspaceRequest() # WorkspaceUpdateWorkspaceRequest | 

    try:
        api_response = api_instance.workspace_update_workspace(workspace_id, workspace_update_workspace_request)
        print("The response of WorkspaceApi->workspace_update_workspace:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WorkspaceApi->workspace_update_workspace: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **workspace_id** | **str**|  | 
 **workspace_update_workspace_request** | [**WorkspaceUpdateWorkspaceRequest**](WorkspaceUpdateWorkspaceRequest.md)|  | 

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**0** | Error response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

