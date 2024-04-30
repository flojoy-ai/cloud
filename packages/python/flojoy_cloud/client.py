import datetime
import json
import os
from typing import Any, Callable, Literal, Optional, ParamSpec, TypeVar, overload

import httpx
import numpy as np
import pandas as pd
from pydantic import BaseModel, TypeAdapter

from flojoy_cloud.dtypes import (
    CountDataPoint,
    Part,
    PartVariation,
    PartVariationComponent,
    PartVariationType,
    PartWithCounts,
    Product,
    SessionMeasurement,
    Test,
    TestProfile,
    TestProfileMetrics,
    TestProfileMetricsOverTime,
    TestSession,
    TestSessionWithMeasurements,
    TestStation,
    Unit,
    UnitRevision,
    UnitTreeRoot,
    Workspace,
    WorkspaceMetrics,
)


# from flojoy_cloud.dtypes import (
#     Hardware,
#     HardwareRevision,
#     HardwareTree,
#     Measurement,
#     MeasurementCreateResult,
#     Model,
#     ModelComponent,
#     ModelTree,
#     Project,
#     ProjectWithModel,
#     SessionMeasurement,
#     Test,
# )
# from flojoy_cloud.measurement import MeasurementData, MeasurementType, make_payload
#
#
class CloudEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime) or isinstance(o, pd.Timestamp):
            return o.isoformat()
        elif isinstance(o, np.datetime64):
            timestamp = o.astype("datetime64[s]").astype(int)
            dt = datetime.datetime.fromtimestamp(timestamp, tz=datetime.timezone.utc)
            return dt.isoformat()
        elif isinstance(o, np.integer):
            return int(o)
        elif isinstance(o, np.floating):
            return float(o)
        elif isinstance(o, np.ndarray):
            return o.tolist()
        return json.JSONEncoder.default(self, o)


TimePeriod = Literal["day", "week", "month", "year"]


class FlojoyCloudException(Exception):
    pass


T = TypeVar("T", bound=BaseModel)
U = TypeVar("U")
P = ParamSpec("P")


@overload
def query(
    model: None,
) -> Callable[[Callable[P, httpx.Response]], Callable[P, None]]: ...


@overload
def query(
    model: type[T],
) -> Callable[[Callable[P, httpx.Response]], Callable[P, T]]: ...


@overload
def query(
    model: TypeAdapter[U],
) -> Callable[[Callable[P, httpx.Response]], Callable[P, U]]: ...


def query(
    model: type[T] | TypeAdapter[U] | None,
) -> Callable[[Callable[P, httpx.Response]], Callable[P, T | U | None]]:
    def decorator(func: Callable[P, httpx.Response]):
        def wrapper(*args: P.args, **kwargs: P.kwargs):
            res = func(*args, **kwargs)

            if res.status_code >= 400:
                error_json = json.loads(res.text)
                raise FlojoyCloudException(
                    f"An exception occurred when making a request\n "
                    f"{error_json['code']}: {error_json['message']}"
                )
            if model is None:
                return None

            match model:
                case TypeAdapter():
                    return model.validate_json(res.text)
                case _:
                    return model.model_validate_json(res.text)

        return wrapper

    return decorator


def _make_params(params: dict[str, Any]):
    return {k: v for k, v in params.items() if v is not None}


class FlojoyCloud:
    client: httpx.Client

    def __init__(
        self,
        *,
        workspace_secret: str | None = None,
        api_url: str = "https://cloud.flojoy.ai/api",
    ):
        if workspace_secret is None:
            env = os.environ.get("FLOJOY_CLOUD_WORKSPACE_SECRET")
            if env is None:
                raise EnvironmentError(
                    "Flojoy Cloud workspace secret not set, and no 'FLOJOY_CLOUD_WORKSPACE_SECRET' environment variable was found."
                )
            workspace_secret = env
        self.base_url = api_url
        self.client = httpx.Client(
            base_url=api_url,
            headers={
                "flojoy-workspace-personal-secret": workspace_secret,
            },
            timeout=10,
        )

    @query(model=TypeAdapter(list[Workspace]))
    def get_workspaces(self):
        return self.client.get("/workspace/user")

    """Products routes"""

    @query(model=TypeAdapter(list[Product]))
    def get_products(self):
        return self.client.get("/products")

    """Part routes"""

    @query(model=TypeAdapter(list[PartWithCounts]))
    def get_parts(self):
        return self.client.get("/part")

    # @query(model=Part)
    # def create_part(self, name: str, description: str | None, product_id: str):
    #     return self.client.post(
    #         "/parts",
    #         json=_make_params(
    #             {"name": name, "description": description, "product_id": product_id}
    #         ),
    #     )

    @query(model=PartWithCounts)
    def get_part(self, part_id: str):
        return self.client.get(f"/part/{part_id}")

    @query(model=TypeAdapter(list[PartVariation]))
    def get_part_part_variations(self, part_id: str):
        return self.client.get(f"/part/{part_id}/partVariation")

    """Part Variation routes"""

    @query(model=TypeAdapter(list[PartVariation]))
    def get_part_variations(self):
        return self.client.get("/partVariation")

    # @query(model=TypeAdapter(list[PartVariation]))
    # def create_part_variation(
    #     self,
    #     part_number: str,
    #     part_id: str,
    #     type: str,
    #     market: str,
    #     description: str | None,
    #     components: list[PartVariationComponent],
    # ):
    #     return self.client.post(
    #         "/partVariation",
    #         json=_make_params(
    #             {
    #                 "partNumber": part_number,
    #                 "partId": part_id,
    #                 "type": type,
    #                 "market": market,
    #                 "description": description,
    #                 "components": components,
    #             }
    #         ),
    #     )

    @query(model=TypeAdapter(list[PartVariationType]))
    def get_part_variation_types(self):
        return self.client.get("/partVariation/type")

    @query(model=TypeAdapter(list[PartVariationType]))
    def get_part_variation_markets(self):
        return self.client.get("/partVariation/market")

    @query(model=PartVariation)
    def get_part_variation(self, part_variation_id: str):
        return self.client.get(f"/partVariation/{part_variation_id}")

    @query(model=TypeAdapter(list[Unit]))
    def get_part_variation_units(self, part_variation_id: str):
        return self.client.get(f"/partVariation/{part_variation_id}/unit")

    """Unit routes"""

    @query(model=TypeAdapter(list[Unit]))
    def get_units(self, only_available: bool = False):
        return self.client.get(
            "/unit", params=_make_params({"onlyAvailable": only_available})
        )

    # @query(model=Unit)
    # def create_unit(
    #     self,
    #     serial_number: str,
    #     part_variation_id: str,
    #     components: list[str] | None = None,
    # ):
    #     if not components:
    #         components = []
    #
    #     return self.client.post(
    #         "/unit",
    #         json=_make_params(
    #             {
    #                 "serialNumber": serial_number,
    #                 "partVariationId": part_variation_id,
    #                 "components": components,
    #             }
    #         ),
    #     )

    @query(model=UnitTreeRoot)
    def get_unit(self, unit_id: str):
        return self.client.get(f"/unit/{unit_id}")

    # @query(model=None)
    # def swap_unit_component(
    #     self,
    #     unit_id: str,
    #     old_unit_component_id: str,
    #     new_unit_components_id: str,
    #     reason: str | None,
    # ):
    #     return self.client.patch(
    #         f"/unit/{unit_id}",
    #         json=_make_params(
    #             {
    #                 "oldUnitComponentId": old_unit_component_id,
    #                 "newUnitComponentId": new_unit_components_id,
    #                 "reason": reason,
    #             }
    #         ),
    #     )

    @query(model=TypeAdapter(list[UnitRevision]))
    def get_unit_revisions(self, unit_id: str):
        return self.client.get(f"/unit/{unit_id}/revisions")

    """Project (Test Profile) routes"""

    @query(model=TypeAdapter(list[TestProfile]))
    def get_test_profiles(self):
        return self.client.get("/project")

    # @query(model=TestProfile)
    # def create_test_profile(
    #     self,
    #     name: str,
    #     part_variation_id: str,
    #     num_cycles: int,
    #     repo_url: str | None = None,
    # ):
    #     return self.client.post(
    #         "/project",
    #         json=_make_params(
    #             {
    #                 "name": name,
    #                 "partVariationId": part_variation_id,
    #                 "numCycles": num_cycles,
    #                 "repoUrl": repo_url,
    #             }
    #         ),
    #     )

    @query(model=TestProfile)
    def get_test_profile(self, test_profile_id: str):
        return self.client.get(f"/project/{test_profile_id}")

    """Test Station routes"""

    @query(model=TypeAdapter(list[TestStation]))
    def get_test_stations(self, test_profile_id: str):
        return self.client.get("/station")

    @query(model=TypeAdapter(list[TestStation]))
    def get_test_station(self, test_station_id: str):
        return self.client.get(f"/station/{test_station_id}")

    """Test Session routes"""

    @query(model=TypeAdapter(list[TestSession]))
    def get_unit_test_sessions(self, unit_id: str):
        return self.client.get(f"/session/unit/{unit_id}")

    @query(model=TypeAdapter(list[TestSession]))
    def get_test_profile_test_sessions(self, test_profile_id: str):
        return self.client.get(f"/session/project/{test_profile_id}")

    @query(model=TypeAdapter(list[TestSession]))
    def get_test_station_test_sessions(self, test_station_id: str):
        return self.client.get(f"/session/station/{test_station_id}")

    @query(model=TestSessionWithMeasurements)
    def get_test_session(self, test_session_id: str):
        return self.client.get(f"/session/{test_session_id}")

    @query(model=TestSession)
    def upload_test_session(
        self,
        *,
        serial_number: str,
        station_id: str,
        measurements: list[SessionMeasurement],
        integrity: bool,
        aborted: bool,
        notes: str | None = None,
        commit_hash: str | None = None,
        created_at: datetime.datetime | None = None,
    ):
        return self.client.post(
            "/session",
            json=_make_params(
                {
                    "serialNumber": serial_number,
                    "stationId": station_id,
                    "measurements": measurements,
                    "integrity": integrity,
                    "aborted": aborted,
                    "notes": notes,
                    "commitHash": commit_hash,
                    "createdAt": created_at,
                }
            ),
        )
        # return self.client.get(f"/session/{test_session_id}")

    # @query(model=TypeAdapter(list[TestStation]))
    # def create_test_station(self, test_profile_id: str, name: str):
    #     return self.client.post("/station", json=_make_params({
    #         "project_id": test_profile_id,
    #         "name": name,
    #     }))

    """Test routes"""

    @query(model=TypeAdapter(list[Test]))
    def get_tests(self):
        return self.client.get("/test")

    @query(model=TypeAdapter(list[Test]))
    def get_test_measurements(self):
        return self.client.get("/test/measurements")

    """Metrics routes"""

    @query(model=WorkspaceMetrics)
    def get_workspace_metrics(
        self,
        past: TimePeriod | None = None,
        start: datetime.datetime | None = None,
        end: datetime.datetime | None = None,
    ):
        return self.client.get(
            "/metrics/workspace",
            params=_make_params({"past": past, "from": start, "to": end}),
        )

    @query(model=TypeAdapter(list[CountDataPoint]))
    def get_workspace_sessions_over_time(
        self,
        past: TimePeriod | None = None,
        bin: TimePeriod = "day",
        start: datetime.datetime | None = None,
        end: datetime.datetime | None = None,
    ):
        return self.client.get(
            "/metrics/workspace/series/session",
            params=_make_params({"past": past, "bin": bin, "from": start, "to": end}),
        )

    @query(model=TypeAdapter(list[CountDataPoint]))
    def get_workspace_users_over_time(
        self,
        past: TimePeriod | None = None,
        bin: TimePeriod = "day",
        start: datetime.datetime | None = None,
        end: datetime.datetime | None = None,
    ):
        return self.client.get(
            "/metrics/workspace/series/user",
            params=_make_params({"past": past, "bin": bin, "from": start, "to": end}),
        )

    @query(model=TestProfileMetrics)
    def get_test_profile_metrics(
        self,
        test_profile_id: str,
        past: TimePeriod | None = None,
        bin: TimePeriod = "day",
        start: datetime.datetime | None = None,
        end: datetime.datetime | None = None,
    ):
        return self.client.get(
            f"/metrics/project/{test_profile_id}",
            params=_make_params({"past": past, "bin": bin, "from": start, "to": end}),
        )

    @query(model=TestProfileMetricsOverTime)
    def get_test_profile_metrics_over_time(
        self,
        test_profile_id: str,
        past: TimePeriod | None = None,
        bin: TimePeriod = "day",
        start: datetime.datetime | None = None,
        end: datetime.datetime | None = None,
    ):
        return self.client.get(
            f"/metrics/project/{test_profile_id}/series",
            params=_make_params({"past": past, "bin": bin, "from": start, "to": end}),
        )
