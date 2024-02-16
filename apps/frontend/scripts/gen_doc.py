import json
import requests

top = """from flojoy.cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")
"""

examples = {
    "hardware-createHardware": f"""{top}
# Create an instance of a device for an existing model in the current workspace
device = client.create_hardware(
    workspace_id="WORKSPACE_ID",
    name="New Device",
    model_id="DEVICE_MODEL_ID",
)
print(device)

# Specify components for a system, if the hardware model has components
system = client.create_hardware(
    workspace_id="WORKSPACE_ID",
    name="New System",
    model_id="SYSTEM_MODEL_ID"
    device_ids=["HARDWARE_ID1", "HARDWARE_ID2"], # Must match the model
)
print(system)

# Can also add it directly to a project with by passing a project id
device = client.create_hardware(
    workspace_id="WORKSPACE_ID",
    name="New Device",
    model_id="DEVICE_MODEL_ID",
    project_id="PROJECT_ID"
)
""",
    "hardware-getAllHardware": f"""{top}
all_hardware = client.get_all_hardware(workspace_id="WORKSPACE_ID")
print(all_hardware)

# Limit to a specific project
all_hardware = client.get_all_hardware(
    workspace_id="WORKSPACE_ID",
    project_id="PROJECT_ID",
)
print(all_hardware)

# Only get hardware that's not being used as a component in other hardware
available_hardware = client.get_all_hardware(workspace_id="WORKSPACE_ID", only_available=True)
print(available_hardware)
""",
    "hardware-getHardware": f"""{top}
hardware = client.get_hardware("HARDWARE_ID")
print(hardware)
""",
    "hardware-deleteHardware": f"""{top}
client.delete_hardware("HARDWARE_ID")
""",
    "hardware-swapHardwareComponent": f"""{top}
# Swap a component in HARDWARE_ID
client.swap_hardware_component(
    hardware_id="HARDWARE_ID",
    old_component_id="OLD_COMPONENT_ID",
    new_component_id="NEW_COMPONENT_ID",
    reason="bruh",
)
""",
    "hardware-getRevisions": f"""{top}
revisions = client.get_revisions(system.id)
print(revisions)
""",
    "measurement-createMeasurement": """from flojoy.cloud import FlojoyCloud
import pandas as pd

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

data1 = True
data2 = pd.DataFrame({"column1": [1, 2, 3], "column2": [4, 5, 6]})
data3 = 3

# Supports booleans, numbers, and pandas dataframes
client.upload(data=data1, test_id="TEST_ID", hardware_id="HARDWARE_ID")

client.upload(data=data2, test_id="TEST_ID", hardware_id="HARDWARE_ID")

client.upload(data=data3, test_id="TEST_ID", hardware_id="HARDWARE_ID")
""",
    "measurement-getAllMeasurementsByTestId": """from flojoy.cloud import FlojoyCloud
from datetime import datetime

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

measurements = client.get_all_measurements_by_test_id("TEST_ID")
print(measurements)

# Can also specify a date range to get measurements taken between those dates
start_time = datetime(2023, 1, 1, 18, 0, 0) # January 1st, 2023 at 6:00 PM
end_time = datetime(2023, 1, 3, 15, 0, 0) # January 3rd, 2023 at 3:00 PM
measurements = client.get_all_measurements_by_test_id("TEST_ID", start_time, end_time)
print(measurements)
""",
    "measurement-getAllMeasurementsByHardwareId": """from flojoy.cloud import FlojoyCloud
from datetime import datetime

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

# Get everything
measurements = client.get_all_measurements_by_hardware_id("HARDWARE_ID")
print(measurements)

# Only get latest measurement per test
measurements = client.get_all_measurements_by_hardware_id("HARDWARE_ID", latest=True)
print(measurements)

# Can also specify a date range to get measurements taken between those dates
start_time = datetime(2023, 1, 1, 18, 0, 0) # January 1st, 2023 at 6:00 PM
end_time = datetime(2023, 1, 3, 15, 0, 0) # January 3rd, 2023 at 3:00 PM
measurements = client.get_all_measurements_by_hardware_id("HARDWARE_ID", start_time, end_time)
print(measurements)
""",
    "measurement-getMeasurement": f"""{top}
meas = client.get_measurement("MEASUREMENT_ID")
print(meas)
""",
    "measurement-deleteMeasurement": f"""{top}
client.delete_measurement("MEASUREMENT_ID")
""",
    "model-createModel": """from flojoy.cloud import FlojoyCloud, ModelComponent

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

# Creating a model without any subcomponents
device_model = client.create_model(
    name="New Device Model", workspace_id="WORKSPACE_ID"
)

# Creating a model with subcomponents
# Has 2 of the previous model
system_model = client.create_system_model(
    name="New System Model",
    workspace_id="WORKSPACE_ID"
    parts=[
        SystemModelPart(modelId=device_model.id, count=2),
    ],
)
""",
    "model-getAllModels": f"""{top}
models = client.get_all_models(workspace_id="WORKSPACE_ID")
""",
    "model-getModel": f"""{top}
model = client.get_model("WORKSPACE_ID")
""",
    "model-deleteModel": f"""{top}
client.delete_model("WORKSPACE_ID")
""",
    "project-createProject": f"""{top}
project = client.create_project(
    name="New Project Name", model_id="MODEL_ID", workspace_id="WORKSPACE_ID"
)
print(project)
""",
    "project-getProject": f"""{top}
project = client.get_project("PROJECT_ID")
print(project)
""",
    "project-getAllProjects": f"""{top}
projects = client.get_all_projects("WORKSPACE_ID")
print(projects)
""",
    "project-addHardwareToProject": f"""{top}
client.add_hardware_to_project(
    project_id="PROJECT_ID",
    hardware_id="HARDWARE_ID"
)
""",
    "project-removeHardwareFromProject": f"""{top}
client.remove_hardware_from_project(
    project_id="PROJECT_ID",
    hardware_id="HARDWARE_ID"
)
""",
    "project-setProjectHardware": f"""{top}
client.set_project_hardware(
    project_id=device_project.id, hardware_ids=["DEVICE_ID1", "DEVICE_ID2"]
)
""",
    "project-updateProject": f"""{top}
client.update_project(name="Updated Project Name", project_id="PROJECT_ID")
""",
    "project-deleteProject": f"""{top}
client.delete_project("PROJECT_ID")
""",
    "test-createTest": f"""{top}
test = client.create_test("New Test", "PROJECT_ID", measurement_type="boolean")
print(test)
""",
    "test-getTest": f"""{top}
test = client.get_test("TEST_ID")
print(test)
""",
    "test-getAllTestsByProjectId": f"""{top}
tests = client.get_all_tests_by_project_id("PROJECT_ID")
print(tests)
""",
    "test-updateTest": f"""{top}
client.update_test(name="Updated Name", test_id="TEST_ID")
""",
    "test-deleteTest": f"""{top}
client.delete_test("TEST_ID")
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
