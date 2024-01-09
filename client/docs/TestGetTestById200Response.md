# TestGetTestById200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | 
**measurement_type** | **str** |  | 
**name** | **str** |  | 
**project_id** | **str** |  | 
**created_at** | **datetime** |  | 
**updated_at** | **datetime** |  | 
**measurements** | [**List[TestGetTestById200ResponseMeasurementsInner]**](TestGetTestById200ResponseMeasurementsInner.md) |  | 

## Example

```python
from openapi_client.models.test_get_test_by_id200_response import TestGetTestById200Response

# TODO update the JSON string below
json = "{}"
# create an instance of TestGetTestById200Response from a JSON string
test_get_test_by_id200_response_instance = TestGetTestById200Response.from_json(json)
# print the JSON string representation of the object
print TestGetTestById200Response.to_json()

# convert the object into a dict
test_get_test_by_id200_response_dict = test_get_test_by_id200_response_instance.to_dict()
# create an instance of TestGetTestById200Response from a dict
test_get_test_by_id200_response_form_dict = test_get_test_by_id200_response.from_dict(test_get_test_by_id200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


