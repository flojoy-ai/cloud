# openapi_client.ProjectApi

All URIs are relative to *http://localhost:3000/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**project_create_project**](ProjectApi.md#project_create_project) | **POST** /v1/projects | 
[**project_get_all_projects_by_workspace_id**](ProjectApi.md#project_get_all_projects_by_workspace_id) | **GET** /v1/projects | 
[**project_get_project_by_id**](ProjectApi.md#project_get_project_by_id) | **GET** /v1/projects/{projectId} | 


# **project_create_project**
> ProjectGetAllProjectsByWorkspaceId200ResponseInner project_create_project(project_create_project_request)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.project_create_project_request import ProjectCreateProjectRequest
from openapi_client.models.project_get_all_projects_by_workspace_id200_response_inner import ProjectGetAllProjectsByWorkspaceId200ResponseInner
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
    api_instance = openapi_client.ProjectApi(api_client)
    project_create_project_request = openapi_client.ProjectCreateProjectRequest() # ProjectCreateProjectRequest | 

    try:
        api_response = api_instance.project_create_project(project_create_project_request)
        print("The response of ProjectApi->project_create_project:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProjectApi->project_create_project: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_create_project_request** | [**ProjectCreateProjectRequest**](ProjectCreateProjectRequest.md)|  | 

### Return type

[**ProjectGetAllProjectsByWorkspaceId200ResponseInner**](ProjectGetAllProjectsByWorkspaceId200ResponseInner.md)

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

# **project_get_all_projects_by_workspace_id**
> List[ProjectGetAllProjectsByWorkspaceId200ResponseInner] project_get_all_projects_by_workspace_id(workspace_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.project_get_all_projects_by_workspace_id200_response_inner import ProjectGetAllProjectsByWorkspaceId200ResponseInner
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
    api_instance = openapi_client.ProjectApi(api_client)
    workspace_id = 'workspace_id_example' # str | 

    try:
        api_response = api_instance.project_get_all_projects_by_workspace_id(workspace_id)
        print("The response of ProjectApi->project_get_all_projects_by_workspace_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProjectApi->project_get_all_projects_by_workspace_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **workspace_id** | **str**|  | 

### Return type

[**List[ProjectGetAllProjectsByWorkspaceId200ResponseInner]**](ProjectGetAllProjectsByWorkspaceId200ResponseInner.md)

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

# **project_get_project_by_id**
> ProjectGetAllProjectsByWorkspaceId200ResponseInner project_get_project_by_id(project_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.project_get_all_projects_by_workspace_id200_response_inner import ProjectGetAllProjectsByWorkspaceId200ResponseInner
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
    api_instance = openapi_client.ProjectApi(api_client)
    project_id = 'project_id_example' # str | 

    try:
        api_response = api_instance.project_get_project_by_id(project_id)
        print("The response of ProjectApi->project_get_project_by_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProjectApi->project_get_project_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 

### Return type

[**ProjectGetAllProjectsByWorkspaceId200ResponseInner**](ProjectGetAllProjectsByWorkspaceId200ResponseInner.md)

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

