# DeviceGetDeviceById200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | 
**name** | **str** |  | 
**project_id** | **str** |  | 
**created_at** | **datetime** |  | 
**updated_at** | **datetime** |  | 
**measurements** | [**List[TestGetTestById200ResponseMeasurementsInner]**](TestGetTestById200ResponseMeasurementsInner.md) |  | 

## Example

```python
from openapi_client.models.device_get_device_by_id200_response import DeviceGetDeviceById200Response

# TODO update the JSON string below
json = "{}"
# create an instance of DeviceGetDeviceById200Response from a JSON string
device_get_device_by_id200_response_instance = DeviceGetDeviceById200Response.from_json(json)
# print the JSON string representation of the object
print DeviceGetDeviceById200Response.to_json()

# convert the object into a dict
device_get_device_by_id200_response_dict = device_get_device_by_id200_response_instance.to_dict()
# create an instance of DeviceGetDeviceById200Response from a dict
device_get_device_by_id200_response_form_dict = device_get_device_by_id200_response.from_dict(device_get_device_by_id200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


