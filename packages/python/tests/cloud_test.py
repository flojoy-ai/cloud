from typing import Tuple

import pytest

from flojoy_cloud import FlojoyCloud

WorkspaceInfo = Tuple[FlojoyCloud, str]

# Set all of these variables to run the tests
# This is designed to be run on a workspace with the example data
WORKSPACE_SECRET = ""
API_URL = "http://localhost:3000/api/v1"

runnable = WORKSPACE_SECRET != "" and API_URL != ""
pytestmark = pytest.mark.skipif(not runnable, reason="Need environment setup")


@pytest.fixture
def workspace():
    client = FlojoyCloud(workspace_secret=WORKSPACE_SECRET, api_url=API_URL)
    return client
