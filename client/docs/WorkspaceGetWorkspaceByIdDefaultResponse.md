# WorkspaceGetWorkspaceByIdDefaultResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **str** |  | 
**code** | **str** |  | 
**issues** | [**List[WorkspaceGetWorkspaceByIdDefaultResponseIssuesInner]**](WorkspaceGetWorkspaceByIdDefaultResponseIssuesInner.md) |  | [optional] 

## Example

```python
from openapi_client.models.workspace_get_workspace_by_id_default_response import WorkspaceGetWorkspaceByIdDefaultResponse

# TODO update the JSON string below
json = "{}"
# create an instance of WorkspaceGetWorkspaceByIdDefaultResponse from a JSON string
workspace_get_workspace_by_id_default_response_instance = WorkspaceGetWorkspaceByIdDefaultResponse.from_json(json)
# print the JSON string representation of the object
print WorkspaceGetWorkspaceByIdDefaultResponse.to_json()

# convert the object into a dict
workspace_get_workspace_by_id_default_response_dict = workspace_get_workspace_by_id_default_response_instance.to_dict()
# create an instance of WorkspaceGetWorkspaceByIdDefaultResponse from a dict
workspace_get_workspace_by_id_default_response_form_dict = workspace_get_workspace_by_id_default_response.from_dict(workspace_get_workspace_by_id_default_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


