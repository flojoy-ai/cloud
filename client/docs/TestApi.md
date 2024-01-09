# openapi_client.TestApi

All URIs are relative to *http://localhost:3000/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**test_create_test**](TestApi.md#test_create_test) | **POST** /v1/tests | 
[**test_get_all_tests_by_project_id**](TestApi.md#test_get_all_tests_by_project_id) | **GET** /v1/tests | 
[**test_get_test_by_id**](TestApi.md#test_get_test_by_id) | **GET** /v1/tests/{testId} | 


# **test_create_test**
> TestGetAllTestsByProjectId200ResponseInner test_create_test(test_create_test_request)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.test_create_test_request import TestCreateTestRequest
from openapi_client.models.test_get_all_tests_by_project_id200_response_inner import TestGetAllTestsByProjectId200ResponseInner
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
    api_instance = openapi_client.TestApi(api_client)
    test_create_test_request = openapi_client.TestCreateTestRequest() # TestCreateTestRequest | 

    try:
        api_response = api_instance.test_create_test(test_create_test_request)
        print("The response of TestApi->test_create_test:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TestApi->test_create_test: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **test_create_test_request** | [**TestCreateTestRequest**](TestCreateTestRequest.md)|  | 

### Return type

[**TestGetAllTestsByProjectId200ResponseInner**](TestGetAllTestsByProjectId200ResponseInner.md)

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

# **test_get_all_tests_by_project_id**
> List[TestGetAllTestsByProjectId200ResponseInner] test_get_all_tests_by_project_id(project_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.test_get_all_tests_by_project_id200_response_inner import TestGetAllTestsByProjectId200ResponseInner
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
    api_instance = openapi_client.TestApi(api_client)
    project_id = 'project_id_example' # str | 

    try:
        api_response = api_instance.test_get_all_tests_by_project_id(project_id)
        print("The response of TestApi->test_get_all_tests_by_project_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TestApi->test_get_all_tests_by_project_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 

### Return type

[**List[TestGetAllTestsByProjectId200ResponseInner]**](TestGetAllTestsByProjectId200ResponseInner.md)

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

# **test_get_test_by_id**
> TestGetTestById200Response test_get_test_by_id(test_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.test_get_test_by_id200_response import TestGetTestById200Response
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
    api_instance = openapi_client.TestApi(api_client)
    test_id = 'test_id_example' # str | 

    try:
        api_response = api_instance.test_get_test_by_id(test_id)
        print("The response of TestApi->test_get_test_by_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TestApi->test_get_test_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **test_id** | **str**|  | 

### Return type

[**TestGetTestById200Response**](TestGetTestById200Response.md)

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

