import datetime
import json
import os
from typing import Callable, Optional, ParamSpec, TypeVar, Union, overload

import httpx
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field, TypeAdapter
from typing_extensions import Annotated

from flojoy_cloud.dtypes import (
    Device,
    DeviceModel,
    Hardware,
    MeasurementWithHardware,
    Project,
    ProjectWithModel,
    System,
    SystemModel,
    SystemModelPart,
    Test,
)
from flojoy_cloud.measurement import MeasurementData, MeasurementType, make_payload


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


class FlojoyCloudException(Exception):
    pass


T = TypeVar("T", bound=BaseModel)
U = TypeVar("U")
P = ParamSpec("P")


@overload
def query(
    model: None,
) -> Callable[[Callable[P, httpx.Response]], Callable[P, None]]:
    ...


@overload
def query(
    model: type[T],
) -> Callable[[Callable[P, httpx.Response]], Callable[P, T]]:
    ...


@overload
def query(
    model: TypeAdapter[U],
) -> Callable[[Callable[P, httpx.Response]], Callable[P, U]]:
    ...


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


class FlojoyCloud:
    client: httpx.Client

    def __init__(
        self,
        workspace_secret: Optional[str] = None,
        api_url="https://cloud.flojoy.ai/api/v1",
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
                "Authorization": f"Bearer {workspace_secret}",
            },
            timeout=10,
        )

    """Test Endpoints"""

    @query(model=Test)
    def create_test(
        self, name: str, project_id: str, measurement_type: MeasurementType
    ):
        return self.client.post(
            "/tests",
            json={
                "name": name,
                "projectId": project_id,
                "measurementType": measurement_type,
            },
        )

    @query(model=Test)
    def get_test(self, test_id: str):
        return self.client.get(f"/tests/{test_id}")

    @query(model=TypeAdapter(list[Test]))
    def get_all_tests_by_project_id(self, project_id: str):
        return self.client.get(
            "/tests",
            params={"projectId": project_id},
        )

    @query(model=None)
    def update_test(
        self,
        name: str,
        test_id: str,
    ):
        return self.client.patch(f"/tests/{test_id}", json={"name": name})

    @query(model=None)
    def delete_test(self, test_id: str):
        return self.client.delete(f"/tests/{test_id}")

    """Model Endpoints"""

    @query(model=DeviceModel)
    def create_device_model(self, name: str, workspace_id: str):
        return self.client.post(
            "/models/devices", json={"name": name, "workspaceId": workspace_id}
        )

    @query(model=SystemModel)
    def create_system_model(
        self, name: str, workspace_id: str, parts: list[SystemModelPart]
    ):
        return self.client.post(
            "/models/systems",
            json={
                "name": name,
                "workspaceId": workspace_id,
                "parts": [part.model_dump() for part in parts],
            },
        )

    @query(
        model=TypeAdapter(
            list[
                Annotated[Union[DeviceModel, SystemModel], Field(discriminator="type")]
            ]
        )
    )
    def get_all_models(self, workspace_id: str):
        return self.client.get("/models", params={"workspaceId": workspace_id})

    @query(model=TypeAdapter(list[DeviceModel]))
    def get_all_device_models(self, workspace_id: str):
        return self.client.get("/models/devices", params={"workspaceId": workspace_id})

    @query(model=TypeAdapter(list[SystemModel]))
    def get_all_system_models(self, workspace_id: str):
        return self.client.get("/models/systems", params={"workspaceId": workspace_id})

    @query(model=None)
    def delete_model(self, model_id: str):
        return self.client.delete(f"/models/{model_id}")

    """Hardware Endpoints"""

    @query(model=Hardware)
    def create_device(
        self,
        workspace_id: str,
        name: str,
        model_id: str,
        project_id: Optional[str] = None,
    ):
        body = {"name": name, "modelId": model_id, "workspaceId": workspace_id}
        if project_id is not None:
            body["projectId"] = project_id

        return self.client.post("/hardware/devices", json=body)

    @query(model=Hardware)
    def create_system(
        self,
        workspace_id: str,
        name: str,
        model_id: str,
        device_ids: list[str],
        project_id: Optional[str] = None,
    ):
        body = {
            "name": name,
            "modelId": model_id,
            "deviceIds": device_ids,
            "workspaceId": workspace_id,
        }
        if project_id is not None:
            body["projectId"] = project_id

        return self.client.post("/hardware/systems", json=body)

    @query(model=Hardware)
    def get_hardware(self, hardware_id: str):
        return self.client.get(f"/hardware/{hardware_id}")

    @query(model=TypeAdapter(list[Hardware]))
    def get_all_hardware(
        self,
        workspace_id: str,
        project_id: Optional[str] = None,
        only_available: Optional[bool] = None,
    ):
        params = {"workspaceId": workspace_id}
        if project_id is not None:
            params["projectId"] = project_id
        if only_available is not None:
            params["onlyAvailable"] = str(only_available)

        return self.client.get("/hardware", params=params)

    @query(model=TypeAdapter(list[Device]))
    def get_all_devices(
        self,
        workspace_id: str,
        project_id: Optional[str] = None,
        only_available: Optional[bool] = None,
    ):
        params = {"workspaceId": workspace_id, "onlyAvailable": only_available}
        if project_id is not None:
            params["projectId"] = project_id
        if only_available is not None:
            params["onlyAvailable"] = str(only_available)

        return self.client.get("/hardware/all/devices", params=params)

    @query(model=TypeAdapter(list[System]))
    def get_all_systems(
        self,
        workspace_id: str,
        project_id: Optional[str] = None,
    ):
        params = {"workspaceId": workspace_id}
        if project_id is not None:
            params["projectId"] = project_id

        return self.client.get("/hardware/all/systems", params=params)

    @query(model=None)
    def delete_hardware(self, hardware_id: str):
        return self.client.delete(f"/hardware/{hardware_id}")

    @query(model=None)
    def update_hardware(self, hardware_id: str, name: str):
        return self.client.patch(f"/hardware/{hardware_id}", json={"name": name})

    """Measurement Endpoints"""

    @query(model=None)
    def upload(
        self,
        data: MeasurementData,
        test_id: str,
        hardware_id: str,
        name: str | None = None,
        passed: bool | None = None,
        created_at: datetime.datetime | None = None,
    ):
        body = {
            "testId": test_id,
            "hardwareId": hardware_id,
            "data": make_payload(data),
        }
        if name is not None:
            body["name"] = name
        if created_at is not None:
            body["createdAt"] = created_at.isoformat()
        if passed is not None:
            body["pass"] = passed

        return self.client.post(
            "/measurements",
            content=json.dumps(body, cls=CloudEncoder),
            headers={
                "Content-Type": "application/json",
            },
        )

    @query(model=TypeAdapter(list[MeasurementWithHardware]))
    def get_all_measurements_by_test_id(
        self,
        test_id: str,
        start_date: datetime.datetime | None = None,
        end_date: datetime.datetime | None = None,
    ):
        query_params = {}
        if start_date is not None:
            query_params["startDate"] = start_date.isoformat()
        if end_date is not None:
            query_params["endDate"] = end_date.isoformat()

        return self.client.get(
            f"/measurements/test/{test_id}",
            params=query_params,
        )

    @query(model=TypeAdapter(list[MeasurementWithHardware]))
    def get_all_measurements_by_hardware_id(
        self,
        hardware_id: str,
        start_date: datetime.datetime | None = None,
        end_date: datetime.datetime | None = None,
        latest: bool | None = None,
    ):
        query_params = {}
        if start_date is not None:
            query_params["startDate"] = start_date.isoformat()
        if end_date is not None:
            query_params["endDate"] = end_date.isoformat()
        if latest is not None:
            query_params["latest"] = latest

        return self.client.get(
            f"/measurements/hardware/{hardware_id}",
            params=query_params,
        )

    @query(model=MeasurementWithHardware)
    def get_measurement(self, measurement_id: str):
        return self.client.get(f"/measurements/{measurement_id}")

    @query(model=None)
    def delete_measurement(self, measurement_id: str):
        return self.client.delete(f"/measurements/{measurement_id}")

    """Project Routes"""

    @query(model=Project)
    def create_project(self, name: str, model_id: str, workspace_id: str):
        return self.client.post(
            "/projects",
            json={"name": name, "modelId": model_id, "workspaceId": workspace_id},
        )

    @query(model=ProjectWithModel)
    def get_project(self, project_id: str):
        return self.client.get(f"/projects/{project_id}")

    @query(model=TypeAdapter(list[Project]))
    def get_all_projects(self, workspace_id: str):
        return self.client.get(
            "/projects",
            params={"workspaceId": workspace_id},
        )

    @query(model=None)
    def add_hardware_to_project(self, hardware_id: str, project_id: str):
        return self.client.put(
            f"/projects/{project_id}/hardware/{hardware_id}",
        )

    @query(model=None)
    def remove_hardware_from_project(self, hardware_id: str, project_id: str):
        return self.client.delete(
            f"/projects/{project_id}/hardware/{hardware_id}",
        )

    @query(model=None)
    def set_project_hardware(self, hardware_ids: list[str], project_id: str):
        return self.client.put(
            f"/projects/{project_id}/hardware", json={"hardwareIds": hardware_ids}
        )

    @query(model=None)
    def update_project(self, name: str, project_id: str):
        return self.client.patch(f"/projects/{project_id}", json={"name": name})

    @query(model=None)
    def delete_project(self, project_id: str):
        return self.client.delete(f"/projects/{project_id}")
