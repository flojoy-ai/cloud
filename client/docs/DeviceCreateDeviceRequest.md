# DeviceCreateDeviceRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**project_id** | **str** |  | 

## Example

```python
from openapi_client.models.device_create_device_request import DeviceCreateDeviceRequest

# TODO update the JSON string below
json = "{}"
# create an instance of DeviceCreateDeviceRequest from a JSON string
device_create_device_request_instance = DeviceCreateDeviceRequest.from_json(json)
# print the JSON string representation of the object
print DeviceCreateDeviceRequest.to_json()

# convert the object into a dict
device_create_device_request_dict = device_create_device_request_instance.to_dict()
# create an instance of DeviceCreateDeviceRequest from a dict
device_create_device_request_form_dict = device_create_device_request.from_dict(device_create_device_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


