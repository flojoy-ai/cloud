from __future__ import annotations

import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from flojoy_cloud.measurement import BooleanData, DataframeData, ScalarData


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, protected_namespaces=())


class CloudModel(CamelModel):
    id: str
    created_at: datetime.datetime


class Product(CloudModel):
    name: str
    workspace_id: str
    description: str | None


class Workspace(CloudModel):
    name: str
    description: str | None
    namespace: str
    plan_type: Literal["hobby", "pro", "enterprise"]


class WorkspaceUser(CloudModel):
    user_id: str
    workspace_id: str
    role: Literal["admin", "user"]


class Part(CloudModel):
    name: str
    description: str | None
    workspace_id: str
    product_id: str


class PartWithCounts(Part):
    part_variation_count: int
    unit_count: int


class PartVariationType(CloudModel):
    workspace_id: str
    name: str


class PartVariationMarket(CloudModel):
    workspace_id: str
    name: str


class PartVariationComponent(CloudModel):
    part_variation_id: str
    part_number: str
    count: int


class PartVariation(CloudModel):
    part_number: str
    description: str | None
    part_id: str
    workspace_id: str
    type_id: str
    market_id: str
    type: PartVariationType
    market: PartVariationMarket
    unit_count: int


class Unit(CloudModel):
    serial_number: str
    workspace_id: str
    part_variation_id: str
    lot_number: str | None


class UnitTreeRoot(Unit):
    parent: Unit
    components: list[UnitTreeNode]


class UnitTreeNode(CamelModel):
    id: str
    serial_number: str
    part_variation_id: str
    part_number: str
    components: list[UnitTreeNode]


class UnitRevision(CamelModel):
    created_at: datetime.datetime
    user_id: str
    unit_id: str
    reason: str | None
    revision_type: Literal["init", "remove", "add"]
    component_id: str
    component_serial_number: str
    user_email: str


class TestProfile(CloudModel):
    name: str
    workspace_id: str
    part_variation_id: str
    updated_at: datetime.datetime
    repo_url: str | None
    num_cycles: int


class TestStation(CloudModel):
    project_id: str
    name: str


class TestSession(CloudModel):
    project_id: str
    unit_id: str
    user_id: str
    user_email: str
    station_id: str
    commit_hash: str | None
    integrity: bool
    aborted: bool
    notes: str | None
    duration_ms: int


class TestSessionWithMeasurements(TestSession):
    measurements: list[Measurement]


class Test(CloudModel):
    project_id: str
    name: str
    measurement_type: str
    unit: str | None


class Measurement(CloudModel):
    projectId: str
    id: str
    createdAt: datetime.datetime
    unitId: str
    name: str
    data: BooleanData | ScalarData | DataframeData = Field(..., discriminator="type")
    _pass: bool | None = Field(alias="pass")
    testId: str
    sessionId: str | None
    sequenceName: str | None
    cycleNumber: int | None
    storageProvider: Literal["s3", "postgres"]
    durationMs: int
    isDeleted: bool | None


class SessionMeasurement(CloudModel):
    name: str | None = None
    sequence_name: str | None = None
    cycle_number: int | None = None
    _pass: bool | None = Field(default=None, alias="pass")
    duration_ms: int
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)


class PartVariationFailurePoint(BaseModel):
    part_number: str
    count: int


class ProductFailurePoint(BaseModel):
    name: str
    count: int


class WorkspaceMetrics(BaseModel):
    test_session_count: int
    measurement_count: int
    part_variation_count: int
    unit_count: int
    user_count: int
    part_variation_failure_distribution: list[PartVariationFailurePoint]
    product_failure_distribution: list[ProductFailurePoint]


class CountDataPoint(BaseModel):
    bin: datetime.datetime
    count: int


class TestProfileMetrics(BaseModel):
    test_session_count: int
    unit_count: int
    mean_sessions_per_unit: float
    session_passed_count: int
    session_failed_count: int
    session_aborted_count: int
    mean_cycle_time: float
    mean_session_time: float
    total_failed_test_time: int
    first_pass_yield: float
    test_yield: float


class IntDataPoint(BaseModel):
    bin: datetime.datetime
    val: int


class FloatDataPoint(BaseModel):
    bin: datetime.datetime
    val: float


class TestProfileMetricsOverTime(BaseModel):
    test_session_count: list[IntDataPoint]
    unit_count: list[IntDataPoint]
    mean_sessions_per_unit: list[FloatDataPoint]
    session_passed_count: list[IntDataPoint]
    session_failed_count: list[IntDataPoint]
    session_aborted_count: list[IntDataPoint]
    mean_cycle_time: list[FloatDataPoint]
    mean_session_time: list[FloatDataPoint]
    total_failed_test_time: list[IntDataPoint]
    first_pass_yield: list[FloatDataPoint]
    test_yield: list[FloatDataPoint]
