# TestGetTestById200ResponseMeasurementsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**is_deleted** | **bool** |  | 
**data** | [**TestGetTestById200ResponseMeasurementsInnerData**](TestGetTestById200ResponseMeasurementsInnerData.md) |  | 
**device_id** | **str** |  | 
**id** | **str** |  | 
**measurement_type** | **str** |  | 
**name** | **str** |  | 
**storage_provider** | **str** |  | 
**test_id** | **str** |  | 
**created_at** | **datetime** |  | 
**test** | [**TestGetAllTestsByProjectId200ResponseInner**](TestGetAllTestsByProjectId200ResponseInner.md) |  | 
**device** | [**TestGetTestById200ResponseMeasurementsInnerDevice**](TestGetTestById200ResponseMeasurementsInnerDevice.md) |  | 

## Example

```python
from openapi_client.models.test_get_test_by_id200_response_measurements_inner import TestGetTestById200ResponseMeasurementsInner

# TODO update the JSON string below
json = "{}"
# create an instance of TestGetTestById200ResponseMeasurementsInner from a JSON string
test_get_test_by_id200_response_measurements_inner_instance = TestGetTestById200ResponseMeasurementsInner.from_json(json)
# print the JSON string representation of the object
print TestGetTestById200ResponseMeasurementsInner.to_json()

# convert the object into a dict
test_get_test_by_id200_response_measurements_inner_dict = test_get_test_by_id200_response_measurements_inner_instance.to_dict()
# create an instance of TestGetTestById200ResponseMeasurementsInner from a dict
test_get_test_by_id200_response_measurements_inner_form_dict = test_get_test_by_id200_response_measurements_inner.from_dict(test_get_test_by_id200_response_measurements_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


