from typing import Tuple

import pytest
import pandas as pd

from flojoy_cloud import FlojoyCloud
from flojoy_cloud import ModelComponent

WorkspaceInfo = Tuple[FlojoyCloud, str]

# Set all of these variables to run the tests
# This should be run in a completely fresh/empty workspace.
WORKSPACE_SECRET = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyX2tpcDJqY2M5eHc0MnV5NnFvMWN2ZHJ1NSIsIndvcmtzcGFjZUlkIjoid29ya3NwYWNlX25icTM3eHVscmx0anFueXRlejBrbGcweiIsImlhdCI6MTcwNzk0MDk5MH0.s9ZnDqGKWVOW0pg1cA3fN8YeniFY5Oi44QGqprwCiYM"
API_URL = "http://localhost:3000/api/v1"
WORKSPACE_ID = "workspace_nbq37xulrltjqnytez0klg0z"

runnable = WORKSPACE_SECRET != "" and API_URL != "" and WORKSPACE_ID != ""
pytestmark = pytest.mark.skipif(not runnable, reason="Need environment setup")


@pytest.fixture
def workspace():
    client = FlojoyCloud(workspace_secret=WORKSPACE_SECRET, api_url=API_URL)
    return client, WORKSPACE_ID


@pytest.fixture
def reset(workspace: WorkspaceInfo):
    client, workspace_id = workspace
    hw = client.get_all_hardware(workspace_id)
    systems = (h for h in hw if "system" in h.name)
    for sys in systems:
        client.delete_hardware(sys.id)
    devices = (h for h in hw if "system" not in h.name)
    for device in devices:
        client.delete_hardware(device.id)

    for project in client.get_all_projects(workspace_id):
        client.delete_project(project.id)

    models = client.get_all_models(workspace_id)
    system_models = (m for m in models if "system" in m.name)
    for model in system_models:
        client.delete_model(model.id)
    device_models = (m for m in models if "system" not in m.name)
    for model in device_models:
        client.delete_model(model.id)


@pytest.fixture
def model_teardown(reset, workspace: WorkspaceInfo):
    yield
    client, workspace_id = workspace
    for model in client.get_all_models(workspace_id):
        client.delete_model(model.id)


def test_model_routes(workspace: WorkspaceInfo, model_teardown):
    client, workspace_id = workspace
    device_model = client.create_model(
        name="test-device-model", workspace_id=workspace_id
    )
    device_model2 = client.create_model(
        name="test-device-model2", workspace_id=workspace_id
    )
    system_model = client.create_model(
        name="test-system-model",
        workspace_id=workspace_id,
        components=[
            ModelComponent(modelId=device_model.id, count=2),
            ModelComponent(modelId=device_model2.id, count=1),
        ],
    )

    models = client.get_all_models(workspace_id=workspace_id)
    assert len(models) == 3

    models = [model.id for model in models]

    assert device_model.id in models
    assert device_model2.id in models
    assert system_model.id in models

    tree = client.get_model(system_model.id)
    assert len(tree.components) == 2
    lookup = {component.model.id: component.count for component in tree.components}
    assert device_model.id in lookup
    assert lookup[device_model.id] == 2
    assert device_model2.id in lookup
    assert lookup[device_model2.id] == 1

    client.delete_model(system_model.id)

    models = client.get_all_models(workspace_id=workspace_id)
    assert len(models) == 2
    models = [model.id for model in models]

    assert device_model.id in models
    assert device_model2.id in models
    assert system_model.id not in models

    client.delete_model(device_model.id)

    models = client.get_all_models(workspace_id=workspace_id)
    assert len(models) == 1

    client.delete_model(device_model2.id)

    models = client.get_all_models(workspace_id=workspace_id)
    assert len(models) == 0


@pytest.fixture
def project_setup(reset, workspace: WorkspaceInfo):
    client, workspace_id = workspace
    model = client.create_model("test-model", workspace_id)
    yield model
    for project in client.get_all_projects(workspace_id):
        client.delete_project(project.id)
    client.delete_model(model.id)


def test_project_routes(workspace: WorkspaceInfo, project_setup):
    client, workspace_id = workspace
    model = project_setup

    project1 = client.create_project(
        name="test-project1", model_id=model.id, workspace_id=workspace_id
    )
    get_result = client.get_project(project1.id)

    assert get_result.id == project1.id
    assert get_result.name == project1.name

    project2 = client.create_project(
        name="test-project2", model_id=model.id, workspace_id=workspace_id
    )

    workspace_projects = sorted(
        client.get_all_projects(workspace_id),
        key=lambda x: x.created_at,
    )
    assert [project1, project2] == workspace_projects

    get_result = client.get_project(project2.id)

    assert get_result.id == project2.id
    assert get_result.name == "test-project2"

    client.update_project(name="test-project2-updated", project_id=project2.id)

    get_result = client.get_project(project2.id)

    assert get_result.id == project2.id
    assert get_result.name == "test-project2-updated"

    client.delete_project(project1.id)
    client.delete_project(project2.id)

    workspace_projects = client.get_all_projects(workspace_id)
    assert workspace_projects == []


@pytest.fixture
def hardware_setup(reset, workspace: WorkspaceInfo):
    client, workspace_id = workspace
    device_model = client.create_model("test-device-model", workspace_id)
    system_model = client.create_model(
        "test-system-model",
        workspace_id,
        components=[ModelComponent(modelId=device_model.id, count=2)],
    )
    device_project = client.create_project(
        "device-project", device_model.id, workspace_id
    )
    system_project = client.create_project(
        "system-project", system_model.id, workspace_id
    )

    yield device_model, system_model, device_project, system_project


def test_hardware_routes(workspace: WorkspaceInfo, hardware_setup):
    client, workspace_id = workspace
    device_model, system_model, device_project, system_project = hardware_setup

    # Create some devices
    device1 = client.create_hardware(
        workspace_id=workspace_id,
        name="test-device1",
        model_id=device_model.id,
    )

    res = client.get_hardware(device1.id)
    assert res.id == device1.id
    assert res.name == device1.name
    assert len(res.components) == 0

    device2 = client.create_hardware(
        workspace_id=workspace_id,
        name="test-device2",
        model_id=device_model.id,
    )

    res = client.get_hardware(device2.id)
    assert res.id == device2.id
    assert res.name == device2.name
    assert len(res.components) == 0

    # Create a system
    system = client.create_hardware(
        workspace_id=workspace_id,
        name="test-system",
        model_id=system_model.id,
        components=[device1.id, device2.id],
    )

    res = client.get_hardware(system.id)
    assert res.id == system.id
    assert res.name == system.name
    assert len(res.components) == 2
    assert set(c.id for c in res.components) == {device1.id, device2.id}

    revisions = client.get_revisions(system.id)
    assert len(revisions) == 2
    assert all(rev.revision_type == "init" for rev in revisions)

    swap = client.create_hardware(
        workspace_id=workspace_id,
        name="swap",
        model_id=device_model.id,
    )

    client.swap_hardware_component(
        hardware_id=system.id,
        old_component_id=device1.id,
        new_component_id=swap.id,
        reason="bruh",
    )

    revisions = client.get_revisions(system.id)
    assert len(revisions) == 4

    res = client.get_hardware(system.id)
    assert len(res.components) == 2
    assert set(c.id for c in res.components) == {swap.id, device2.id}

    hardware = client.get_all_hardware(workspace_id)
    assert len(hardware) == 4

    devices = client.get_all_hardware(workspace_id, only_available=True)
    assert len(devices) == 2

    # Add to project
    client.add_hardware_to_project(
        project_id=device_project.id,
        hardware_id=device1.id,
    )

    devices = client.get_all_hardware(workspace_id, project_id=device_project.id)
    assert len(devices) == 1

    # Set it
    client.set_project_hardware(
        project_id=device_project.id, hardware_ids=[device1.id, device2.id]
    )
    devices = client.get_all_hardware(workspace_id, project_id=device_project.id)
    assert len(devices) == 2

    # Then remove both and check again
    client.remove_hardware_from_project(
        project_id=device_project.id,
        hardware_id=device1.id,
    )
    client.remove_hardware_from_project(
        project_id=device_project.id,
        hardware_id=device2.id,
    )

    devices = client.get_all_hardware(workspace_id, project_id=device_project.id)
    assert len(devices) == 0

    # Add system to project
    systems = client.get_all_hardware(workspace_id, project_id=system_project.id)
    assert len(systems) == 0

    client.add_hardware_to_project(
        project_id=system_project.id,
        hardware_id=system.id,
    )

    systems = client.get_all_hardware(workspace_id, project_id=system_project.id)
    assert len(systems) == 1

    client.delete_hardware(system.id)
    hardware = client.get_all_hardware(workspace_id)
    assert len(hardware) == 3

    client.delete_hardware(device1.id)
    devices = client.get_all_hardware(workspace_id)
    assert len(devices) == 2

    client.delete_hardware(device2.id)
    devices = client.get_all_hardware(workspace_id)
    assert len(devices) == 1


@pytest.fixture
def test_setup(reset, workspace: WorkspaceInfo):
    client, workspace_id = workspace
    model = client.create_model("model", workspace_id)
    project = client.create_project("project", model.id, workspace_id)

    yield project

    for test in client.get_all_tests_by_project_id(project.id):
        client.delete_test(test.id)

    client.delete_project(project.id)
    client.delete_model(model.id)


def test_test_routes(workspace: WorkspaceInfo, test_setup):
    client, _ = workspace
    project = test_setup

    test1 = client.create_test(
        name="test1", project_id=project.id, measurement_type="boolean"
    )

    res = client.get_test(test1.id)
    assert res.name == test1.name
    assert res.id == test1.id

    test2 = client.create_test(
        name="test2", project_id=project.id, measurement_type="dataframe"
    )

    res = client.get_test(test2.id)
    assert res.name == test2.name
    assert res.id == test2.id

    client.update_test(name="test2-updated", test_id=test2.id)
    res = client.get_test(test2.id)
    assert res.name == "test2-updated"

    tests = client.get_all_tests_by_project_id(project.id)
    assert len(tests) == 2

    client.delete_test(test1.id)

    tests = client.get_all_tests_by_project_id(project.id)
    assert len(tests) == 1

    client.delete_test(test2.id)

    tests = client.get_all_tests_by_project_id(project.id)
    assert len(tests) == 0


@pytest.fixture
def measurement_setup(reset, workspace: WorkspaceInfo):
    client, workspace_id = workspace
    model = client.create_model("model", workspace_id)
    project = client.create_project("project", model.id, workspace_id)
    device1 = client.create_hardware(
        workspace_id, "device1", model.id, project_id=project.id
    )
    device2 = client.create_hardware(
        workspace_id, "device2", model.id, project_id=project.id
    )

    bool_test = client.create_test(
        "boolean-test", project.id, measurement_type="boolean"
    )
    df_test = client.create_test(
        "dataframe-test", project.id, measurement_type="dataframe"
    )
    scalar_test = client.create_test(
        "scalar-test", project.id, measurement_type="scalar"
    )

    yield bool_test, df_test, scalar_test, device1, device2

    for measurement in client.get_all_measurements_by_test_id(bool_test.id):
        client.delete_measurement(measurement.id)
    for measurement in client.get_all_measurements_by_test_id(df_test.id):
        client.delete_measurement(measurement.id)

    client.delete_test(bool_test.id)
    client.delete_test(df_test.id)

    client.delete_project(project.id)
    client.delete_hardware(device1.id)
    client.delete_hardware(device2.id)
    client.delete_model(model.id)


def test_measurement_routes(workspace: WorkspaceInfo, measurement_setup):
    client, workspace_id = workspace
    bool_test, df_test, scalar_test, device1, device2 = measurement_setup

    client.upload(
        data=True,
        test_id=bool_test.id,
        hardware_id=device1.id,
        name="bool",
    )

    client.upload(
        data=False,
        test_id=bool_test.id,
        hardware_id=device1.id,
        name="bool again",
    )

    client.upload(
        data=pd.DataFrame({"col1": [1, 2, 3], "col2": [4, 5, 6], "col3": [7, 8, 9]}),
        test_id=df_test.id,
        hardware_id=device1.id,
        name="df",
    )

    client.upload(
        data=False,
        test_id=bool_test.id,
        hardware_id=device2.id,
        name="bool 2",
    )

    client.upload(
        data=3,
        test_id=scalar_test.id,
        hardware_id=device2.id,
        name="three",
    )

    bool_measurements = client.get_all_measurements_by_test_id(bool_test.id)
    assert len(bool_measurements) == 3

    df_measurements = client.get_all_measurements_by_test_id(df_test.id)
    assert len(df_measurements) == 1

    scalar_measurements = client.get_all_measurements_by_test_id(scalar_test.id)
    assert len(scalar_measurements) == 1

    d1_measurements = client.get_all_measurements_by_hardware_id(device1.id)
    assert len(d1_measurements) == 3

    d1_measurements = client.get_all_measurements_by_hardware_id(
        device1.id, latest=True
    )
    assert len(d1_measurements) == 2

    d2_measurements = client.get_all_measurements_by_hardware_id(device2.id)
    assert len(d2_measurements) == 2

    bool_meas = client.get_measurement(bool_measurements[0].id)
    assert bool_meas.name == "bool"
    assert bool_meas.data["value"]
    assert bool_meas.id == bool_measurements[0].id

    df_meas = client.get_measurement(df_measurements[0].id)
    assert df_meas.name == "df"

    scalar_meas = client.get_measurement(scalar_measurements[0].id)
    assert scalar_meas.name == "three"
    assert scalar_meas.data["value"] == 3

    client.delete_measurement(bool_meas.id)

    bool_measurements = client.get_all_measurements_by_test_id(bool_test.id)
    assert len(bool_measurements) == 2

    client.delete_measurement(df_meas.id)

    df_measurements = client.get_all_measurements_by_test_id(df_test.id)
    assert len(df_measurements) == 0

    client.delete_measurement(scalar_meas.id)

    scalar_measurements = client.get_all_measurements_by_test_id(scalar_test.id)
    assert len(scalar_test) == 0
