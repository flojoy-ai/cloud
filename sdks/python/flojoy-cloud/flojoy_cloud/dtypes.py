import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from flojoy_cloud.measurement import MeasurementType


class CloudModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, protected_namespaces=())
    id: str
    created_at: datetime.datetime


class SystemModelPart(BaseModel):
    modelId: str
    count: int
    name: str = Field(default="")


class Model(CloudModel):
    name: str
    workspace_id: str


class DeviceModel(Model):
    type: Literal["device"]


class SystemModel(Model):
    type: Literal["system"]
    parts: list[SystemModelPart]


class SystemPart(BaseModel):
    id: str
    name: str
    model: Model


class Hardware(CloudModel):
    name: str
    updated_at: Optional[datetime.datetime]
    workspace_id: str
    model_id: str
    model: Model


class Device(Hardware):
    type: Literal["device"]


class System(Hardware):
    type: Literal["system"]
    parts: list[SystemPart]


StorageProvider = Literal["s3", "postgres"]


class Measurement(CloudModel):
    name: str
    hardware_id: str
    test_id: str
    storage_provider: StorageProvider
    data: dict
    is_deleted: bool


class MeasurementWithHardware(Measurement):
    hardware: Hardware


class Test(CloudModel):
    name: str
    updated_at: Optional[datetime.datetime]
    measurement_type: MeasurementType
    project_id: str


class Project(CloudModel):
    name: str
    updated_at: Optional[datetime.datetime]
    workspace_id: str
    model_id: str


class ProjectWithModel(Project):
    model: Model
