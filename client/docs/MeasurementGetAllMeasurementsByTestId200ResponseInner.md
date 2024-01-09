# MeasurementGetAllMeasurementsByTestId200ResponseInner


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
**device** | [**TestGetTestById200ResponseMeasurementsInnerDevice**](TestGetTestById200ResponseMeasurementsInnerDevice.md) |  | 

## Example

```python
from openapi_client.models.measurement_get_all_measurements_by_test_id200_response_inner import MeasurementGetAllMeasurementsByTestId200ResponseInner

# TODO update the JSON string below
json = "{}"
# create an instance of MeasurementGetAllMeasurementsByTestId200ResponseInner from a JSON string
measurement_get_all_measurements_by_test_id200_response_inner_instance = MeasurementGetAllMeasurementsByTestId200ResponseInner.from_json(json)
# print the JSON string representation of the object
print MeasurementGetAllMeasurementsByTestId200ResponseInner.to_json()

# convert the object into a dict
measurement_get_all_measurements_by_test_id200_response_inner_dict = measurement_get_all_measurements_by_test_id200_response_inner_instance.to_dict()
# create an instance of MeasurementGetAllMeasurementsByTestId200ResponseInner from a dict
measurement_get_all_measurements_by_test_id200_response_inner_form_dict = measurement_get_all_measurements_by_test_id200_response_inner.from_dict(measurement_get_all_measurements_by_test_id200_response_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


