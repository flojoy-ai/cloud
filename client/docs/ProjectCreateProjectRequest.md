# ProjectCreateProjectRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**workspace_id** | **str** |  | 

## Example

```python
from openapi_client.models.project_create_project_request import ProjectCreateProjectRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ProjectCreateProjectRequest from a JSON string
project_create_project_request_instance = ProjectCreateProjectRequest.from_json(json)
# print the JSON string representation of the object
print ProjectCreateProjectRequest.to_json()

# convert the object into a dict
project_create_project_request_dict = project_create_project_request_instance.to_dict()
# create an instance of ProjectCreateProjectRequest from a dict
project_create_project_request_form_dict = project_create_project_request.from_dict(project_create_project_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


