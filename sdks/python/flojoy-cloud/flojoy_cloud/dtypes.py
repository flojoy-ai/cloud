import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from flojoy_cloud.measurement import MeasurementType


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, protected_namespaces=())


class CloudModel(CamelModel):
    id: str
    created_at: datetime.datetime


class ModelComponent(BaseModel):
    modelId: str
    count: int
    name: str = Field(default="")


class Model(CloudModel):
    name: str
    workspace_id: str


class ModelTree(BaseModel):
    id: str
    name: str
    components: list["ModelTreeComponent"]


class ModelTreeComponent(BaseModel):
    count: int
    model: ModelTree


# Required for recursive types
ModelTree.model_rebuild()


class Project(CloudModel):
    name: str
    updated_at: Optional[datetime.datetime]
    workspace_id: str
    model_id: str


class ProjectWithModel(Project):
    model: Model


class Hardware(CloudModel):
    name: str
    workspace_id: str
    model_id: str
    updated_at: Optional[datetime.datetime]


class HardwareWithModelAndProjects(Hardware):
    model: Model
    projects: list[Project]


class HardwareTree(BaseModel):
    id: str
    name: str
    modelId: str
    modelName: str
    components: list["HardwareTree"]


HardwareTree.model_rebuild()

RevisionType = Literal["init", "remove", "add"]


class HardwareRevision(CamelModel):
    created_at: datetime.datetime
    revision_type: RevisionType
    user_id: str
    user_email: str
    hardware_id: str
    component_id: str
    component_name: str
    reason: Optional[str]


StorageProvider = Literal["s3", "postgres"]


class MeasurementCreateResult(BaseModel):
    id: str


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
