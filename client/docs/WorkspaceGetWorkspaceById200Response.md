# WorkspaceGetWorkspaceById200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | 
**name** | **str** |  | 
**plan_type** | **str** |  | 
**total_seats** | **float** |  | 
**created_at** | **datetime** |  | 
**updated_at** | **datetime** |  | 

## Example

```python
from openapi_client.models.workspace_get_workspace_by_id200_response import WorkspaceGetWorkspaceById200Response

# TODO update the JSON string below
json = "{}"
# create an instance of WorkspaceGetWorkspaceById200Response from a JSON string
workspace_get_workspace_by_id200_response_instance = WorkspaceGetWorkspaceById200Response.from_json(json)
# print the JSON string representation of the object
print WorkspaceGetWorkspaceById200Response.to_json()

# convert the object into a dict
workspace_get_workspace_by_id200_response_dict = workspace_get_workspace_by_id200_response_instance.to_dict()
# create an instance of WorkspaceGetWorkspaceById200Response from a dict
workspace_get_workspace_by_id200_response_form_dict = workspace_get_workspace_by_id200_response.from_dict(workspace_get_workspace_by_id200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


