from typing import Literal

from pydantic import BaseModel


class Boolean(BaseModel):
    type: Literal["boolean"] = "boolean"
    passed: bool


class Dataframe(BaseModel):
    type: Literal["dataframe"] = "dataframe"
    dataframe: dict


MeasurementType = Literal["boolean", "dataframe"]

MeasurementData = Boolean | Dataframe
