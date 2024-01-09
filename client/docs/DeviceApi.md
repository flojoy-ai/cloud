# openapi_client.DeviceApi

All URIs are relative to *http://localhost:3000/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**device_create_device**](DeviceApi.md#device_create_device) | **POST** /v1/devices | 
[**device_delete_device_by_id**](DeviceApi.md#device_delete_device_by_id) | **DELETE** /v1/devices/{deviceId} | 
[**device_get_all_devices_by_project_id**](DeviceApi.md#device_get_all_devices_by_project_id) | **GET** /v1/devices | 
[**device_get_device_by_id**](DeviceApi.md#device_get_device_by_id) | **GET** /v1/devices/{deviceId} | 


# **device_create_device**
> TestGetTestById200ResponseMeasurementsInnerDevice device_create_device(device_create_device_request)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.device_create_device_request import DeviceCreateDeviceRequest
from openapi_client.models.test_get_test_by_id200_response_measurements_inner_device import TestGetTestById200ResponseMeasurementsInnerDevice
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
    api_instance = openapi_client.DeviceApi(api_client)
    device_create_device_request = openapi_client.DeviceCreateDeviceRequest() # DeviceCreateDeviceRequest | 

    try:
        api_response = api_instance.device_create_device(device_create_device_request)
        print("The response of DeviceApi->device_create_device:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->device_create_device: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **device_create_device_request** | [**DeviceCreateDeviceRequest**](DeviceCreateDeviceRequest.md)|  | 

### Return type

[**TestGetTestById200ResponseMeasurementsInnerDevice**](TestGetTestById200ResponseMeasurementsInnerDevice.md)

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

# **device_delete_device_by_id**
> TestGetTestById200ResponseMeasurementsInnerDevice device_delete_device_by_id(device_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.test_get_test_by_id200_response_measurements_inner_device import TestGetTestById200ResponseMeasurementsInnerDevice
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
    api_instance = openapi_client.DeviceApi(api_client)
    device_id = 'device_id_example' # str | 

    try:
        api_response = api_instance.device_delete_device_by_id(device_id)
        print("The response of DeviceApi->device_delete_device_by_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->device_delete_device_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **device_id** | **str**|  | 

### Return type

[**TestGetTestById200ResponseMeasurementsInnerDevice**](TestGetTestById200ResponseMeasurementsInnerDevice.md)

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

# **device_get_all_devices_by_project_id**
> List[TestGetTestById200ResponseMeasurementsInnerDevice] device_get_all_devices_by_project_id(project_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.test_get_test_by_id200_response_measurements_inner_device import TestGetTestById200ResponseMeasurementsInnerDevice
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
    api_instance = openapi_client.DeviceApi(api_client)
    project_id = 'project_id_example' # str | 

    try:
        api_response = api_instance.device_get_all_devices_by_project_id(project_id)
        print("The response of DeviceApi->device_get_all_devices_by_project_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->device_get_all_devices_by_project_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **str**|  | 

### Return type

[**List[TestGetTestById200ResponseMeasurementsInnerDevice]**](TestGetTestById200ResponseMeasurementsInnerDevice.md)

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

# **device_get_device_by_id**
> DeviceGetDeviceById200Response device_get_device_by_id(device_id)



### Example


```python
import time
import os
import openapi_client
from openapi_client.models.device_get_device_by_id200_response import DeviceGetDeviceById200Response
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
    api_instance = openapi_client.DeviceApi(api_client)
    device_id = 'device_id_example' # str | 

    try:
        api_response = api_instance.device_get_device_by_id(device_id)
        print("The response of DeviceApi->device_get_device_by_id:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->device_get_device_by_id: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **device_id** | **str**|  | 

### Return type

[**DeviceGetDeviceById200Response**](DeviceGetDeviceById200Response.md)

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

