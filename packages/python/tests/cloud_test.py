from typing import Tuple

import pytest
import pandas as pd

from flojoy_cloud import FlojoyCloud
from flojoy_cloud.dtypes import SessionMeasurement, TestSession
from flojoy_cloud.measurement import make_payload

WorkspaceInfo = Tuple[FlojoyCloud, str]

# Set all of these variables to run the tests
# This is designed to be run on a workspace with the example data
WORKSPACE_SECRET = ""
API_URL = "http://localhost:3000"

runnable = WORKSPACE_SECRET != "" and API_URL != ""
pytestmark = pytest.mark.skipif(not runnable, reason="Need environment setup")


@pytest.fixture
def client():
    client = FlojoyCloud(workspace_secret=WORKSPACE_SECRET, api_url=API_URL)
    return client


def test_workspace_routes(client: FlojoyCloud):
    workspace = client.get_workspaces()
    assert len(workspace) == 1


def test_product_routes(client: FlojoyCloud):
    products = client.get_products()
    assert len(products) >= 1


def test_part_routes(client: FlojoyCloud):
    parts = client.get_parts()
    assert len(parts) >= 1

    first = parts[0]
    part = client.get_part(first.id)
    assert part.id == first.id

    part_variations = client.get_part_part_variations(part.id)
    assert len(part_variations) >= 1


def test_part_variation_routes(client: FlojoyCloud):
    part_variations = client.get_part_variations()
    assert len(part_variations) >= 1

    first = [pv for pv in part_variations if pv.unit_count > 0][0]
    part_variation = client.get_part_variation(first.id)
    assert part_variation.id == first.id

    markets = client.get_part_variation_markets()
    assert len(markets) >= 1

    types = client.get_part_variation_types()
    assert len(types) >= 1

    units = client.get_part_variation_units(part_variation.id)
    assert len(units) == first.unit_count


def test_unit_routes(client: FlojoyCloud):
    units = client.get_units()
    assert len(units) >= 1

    first = units[0]
    unit = client.get_unit(first.id)
    assert unit.id == first.id

    client.get_unit_revisions(unit.id)


def test_test_profile_routes(client: FlojoyCloud):
    profiles = client.get_test_profiles()
    assert len(profiles) >= 1

    first = profiles[0]
    profile = client.get_test_profile(first.id)
    assert profile.id == first.id


def test_test_station_routes(client: FlojoyCloud):
    profile = client.get_test_profiles()[0]

    stations = client.get_test_stations(profile.id)
    assert len(stations) >= 0

    first = stations[0]
    station = client.get_test_station(first.id)
    assert station.id == first.id


def test_test_session_routes(client: FlojoyCloud):
    units = client.get_units()
    unit_sessions = client.get_unit_test_sessions(units[0].id)
    before_upload_unit_session_count = len(unit_sessions)
    assert before_upload_unit_session_count >= 1

    test_profiles = client.get_test_profiles()
    profile_sessions = client.get_test_profile_test_sessions(test_profiles[0].id)
    assert len(profile_sessions) >= 1

    stations = client.get_test_stations(test_profiles[0].id)
    station_sessions = client.get_test_station_test_sessions(stations[0].id)
    before_upload_station_session_count = len(station_sessions)
    assert before_upload_station_session_count >= 0

    first = unit_sessions[0]
    session = client.get_test_session(first.id)
    assert session.id == first.id

    client.upload_test_session(
        serial_number=units[0].serial_number,
        station_id=stations[0].id,
        measurements=[
            SessionMeasurement(
                duration_ms=1000, data=make_payload(1.0, "V"), passed=True
            ),
            SessionMeasurement(duration_ms=1000, data=make_payload(True), passed=True),
            SessionMeasurement(
                duration_ms=1000,
                data=make_payload(pd.DataFrame({"x": [1, 2, 3], "y": [1, 2, 3]})),
                passed=False,
            ),
        ],
        integrity=True,
        aborted=False,
    )

    unit_sessions = client.get_unit_test_sessions(units[0].id)
    station_sessions = client.get_test_station_test_sessions(stations[0].id)

    assert len(unit_sessions) == before_upload_unit_session_count + 1
    assert len(station_sessions) == before_upload_station_session_count + 1
