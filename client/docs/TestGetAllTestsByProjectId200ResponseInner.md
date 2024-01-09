# TestGetAllTestsByProjectId200ResponseInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | 
**measurement_type** | **str** |  | 
**name** | **str** |  | 
**project_id** | **str** |  | 
**created_at** | **datetime** |  | 
**updated_at** | **datetime** |  | 

## Example

```python
from openapi_client.models.test_get_all_tests_by_project_id200_response_inner import TestGetAllTestsByProjectId200ResponseInner

# TODO update the JSON string below
json = "{}"
# create an instance of TestGetAllTestsByProjectId200ResponseInner from a JSON string
test_get_all_tests_by_project_id200_response_inner_instance = TestGetAllTestsByProjectId200ResponseInner.from_json(json)
# print the JSON string representation of the object
print TestGetAllTestsByProjectId200ResponseInner.to_json()

# convert the object into a dict
test_get_all_tests_by_project_id200_response_inner_dict = test_get_all_tests_by_project_id200_response_inner_instance.to_dict()
# create an instance of TestGetAllTestsByProjectId200ResponseInner from a dict
test_get_all_tests_by_project_id200_response_inner_form_dict = test_get_all_tests_by_project_id200_response_inner.from_dict(test_get_all_tests_by_project_id200_response_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


