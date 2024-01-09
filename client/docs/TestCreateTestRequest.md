# TestCreateTestRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**project_id** | **str** |  | 
**measurement_type** | **str** |  | 

## Example

```python
from openapi_client.models.test_create_test_request import TestCreateTestRequest

# TODO update the JSON string below
json = "{}"
# create an instance of TestCreateTestRequest from a JSON string
test_create_test_request_instance = TestCreateTestRequest.from_json(json)
# print the JSON string representation of the object
print TestCreateTestRequest.to_json()

# convert the object into a dict
test_create_test_request_dict = test_create_test_request_instance.to_dict()
# create an instance of TestCreateTestRequest from a dict
test_create_test_request_form_dict = test_create_test_request.from_dict(test_create_test_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


