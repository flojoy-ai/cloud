import json
import requests

top = """from flojoy.cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")
"""

examples = {
    "workspace-updateWorkspace": f"""{top}
client.update_workspace("WORKSPACE_ID", "New Workspace Name")
""",
    "workspace-deleteWorkspaceById": f"""{top}
client.delete_workspace_by_id("WORKSPACE_ID")
""",
    "workspace-getAllWorkspaces": f"""{top}
workspaces = client.get_all_workspaces()
print(workspaces)
""",
    "project-createProject": f"""{top}
project = client.create_project("New Project Name", "WORKSPACE_ID")
print(project)
""",
    "project-getProjectById": f"""{top}
project = client.get_project_by_id("PROJECT_ID")
print(project)
""",
    "project-getAllProjectsByWorkspaceId": f"""{top}
projects = client.get_project_by_id("WORKSPACE_ID")
print(projects)
""",
    "project-addDeviceToProject": f"""{top}
# Create a device
device = client.create_device("New Device", "WORKSPACE_ID")
    
# Add it to a project
client.add_device_to_project(device.id, "PROJECT_ID")
""",
    "project-removeDeviceFromProject": f"""{top}
client.remove_device_from_project("DEVICE_ID", "PROJECT_ID")
""",
    "device-createDevice": f"""{top}
device = client.create_device("New Device", "WORKSPACE_ID")
print(device)
""",
    "device-getDeviceById": f"""{top}
device = client.get_device_by_id("DEVICE_ID")
print(device)
""",
    "device-getAllDevices": f"""{top}
devices = client.get_all_devices("WORKSPACE_ID")
print(devices)

# Can also get all devices in a specific project
devices = client.get_all_devices("WORKSPACE_ID", project_id="PROJECT_ID")
print(devices)
""",
    "device-deleteDeviceById": f"""{top}
client.delete_device_by_id("DEVICE_ID")
""",
    "test-createTest": f"""{top}
test = client.create_test("New Test", "PROJECT_ID", measurement_type="boolean")
print(test)
""",
    "test-getTestById": f"""{top}
test = client.get_test_by_id("TEST_ID")
print(test)
""",
    "test-getAllTestsByProjectId": f"""{top}
tests = client.get_all_tests_by_project_id("PROJECT_ID")
print(tests)
""",
    "measurement-createMeasurement": """from flojoy.cloud import FlojoyCloud, Boolean, Dataframe

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

data = Boolean(passed=True)

client.upload(data, "TEST_ID", "DEVICE_ID")
""",
    "measurement-getAllMeasurementsByTestId": """from flojoy.cloud import FlojoyCloud
from datetime import datetime

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

client.get_all_measurements_by_test_id("TEST_ID")

# Can also specify a date range to get measurements taken between those dates
start_time = datetime(2023, 1, 1, 18, 0, 0) # January 1st, 2023 at 6:00 PM
end_time = datetime(2023, 1, 3, 15, 0, 0) # January 3rd, 2023 at 3:00 PM
client.get_all_measurements_by_test_id("TEST_ID", start_time, end_time)
""",
}


def get_openapi_spec():
    res = requests.get("http://localhost:3000/api/openapi.json")
    return res.json()


def get_endpoint(spec, endpoint_name):
    for methods in spec["paths"].values():
        for endpoint in methods.values():
            if endpoint_name == endpoint["operationId"]:
                return endpoint
    raise KeyError(f"Endpoint {endpoint_name} not found")


def main():
    spec = get_openapi_spec()

    for id, example in examples.items():
        endpoint = get_endpoint(spec, id)
        endpoint["x-theneo-endpoint-metadata"] = {
            "examples": [{"title": "Default", "request": {"python": example}}]
        }

    with open("flojoy_openapi_with_py_examples.json", "w+") as f:
        json.dump(spec, f, indent=2)


if __name__ == "__main__":
    main()
