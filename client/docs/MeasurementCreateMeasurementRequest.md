# MeasurementCreateMeasurementRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | [optional] 
**data** | [**TestGetTestById200ResponseMeasurementsInnerData**](TestGetTestById200ResponseMeasurementsInnerData.md) |  | 
**device_id** | **str** |  | 
**measurement_type** | **str** |  | 
**test_id** | **str** |  | 
**created_at** | **datetime** |  | [optional] 

## Example

```python
from openapi_client.models.measurement_create_measurement_request import MeasurementCreateMeasurementRequest

# TODO update the JSON string below
json = "{}"
# create an instance of MeasurementCreateMeasurementRequest from a JSON string
measurement_create_measurement_request_instance = MeasurementCreateMeasurementRequest.from_json(json)
# print the JSON string representation of the object
print MeasurementCreateMeasurementRequest.to_json()

# convert the object into a dict
measurement_create_measurement_request_dict = measurement_create_measurement_request_instance.to_dict()
# create an instance of MeasurementCreateMeasurementRequest from a dict
measurement_create_measurement_request_form_dict = measurement_create_measurement_request.from_dict(measurement_create_measurement_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


