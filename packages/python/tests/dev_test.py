from datetime import datetime
from typing import Tuple
from flojoy_cloud.dtypes import SessionMeasurement, UploadSession
import pandas as pd
import pytest
from flojoy_cloud import FlojoyCloud, ModelComponent

WorkspaceInfo = Tuple[FlojoyCloud, str]

# Set all of these variables to run the tests
# This should be run in a completely fresh/empty workspace.
WORKSPACE_SECRET = ""
API_URL = "http://localhost:3000/api/v1"
WORKSPACE_ID = ""

runnable = WORKSPACE_SECRET != "" and API_URL != "" and WORKSPACE_ID != ""
pytestmark = pytest.mark.skipif(not runnable, reason="Need environment setup")


@pytest.fixture
def workspace():
    client = FlojoyCloud(workspace_secret=WORKSPACE_SECRET, api_url=API_URL)
    return client, WORKSPACE_ID


def reverse_id(client, test_name, project_id) -> str:
    tests = client.get_all_tests_by_project_id(project_id)
    for i in tests:
        if i.name == test_name:
            return str(i.id)
    raise KeyError(f"No cloud test for {test_name}")


def test_model_routes(workspace: WorkspaceInfo):
    client, _ = workspace

    part_number = "PN-1234"
    serial_number = "SN-1234"
    station_id = "ST-1234"

    measurement: SessionMeasurement = SessionMeasurement(
        data=False,
        test_name="Test Voltage",
        name="Test Voltage",
        passed=True,
        created_at=datetime.now()
    )

    session_id = client.upload_session(
        serial_number=serial_number,
        part_number=part_number,
        station_id=station_id,
        integrity=True,
        aborted=False,
        notes=None,
        commit_hash=None,
        measurements=[measurement]
    )

    assert session_id is not None
