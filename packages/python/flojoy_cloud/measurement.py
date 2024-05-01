from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, field_serializer, field_validator

import pandas as pd

MeasurementData = bool | pd.DataFrame | int | float
MeasurementType = Literal["boolean", "dataframe", "scalar"]


class ScalarData(BaseModel):
    type: Literal["scalar"] = "scalar"
    value: int | float
    unit: str | None = None


class BooleanData(BaseModel):
    type: Literal["boolean"] = "boolean"
    value: bool


class DataframeData(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    type: Literal["dataframe"] = "dataframe"
    value: pd.DataFrame

    @field_serializer("value")
    def serialize_df(self, value: pd.DataFrame, _info):
        out = {}
        # Have to do this weird hack because df.todict('list') behaves strangely
        for col_name, series in value.items():
            out[col_name] = series.tolist()

        return out

    @field_validator("value")
    @classmethod
    def deserialize_df(cls, v: dict[str, Any]):
        return pd.DataFrame.from_dict(v)


def make_payload(data: MeasurementData, unit: str | None = None):
    match data:
        case bool():
            return BooleanData(value=data)
        case pd.DataFrame():
            return DataframeData(value=data)
        case int() | float():
            return ScalarData(value=data, unit=unit)
        case _:
            raise TypeError(f"Unsupported data type: {type(data)}")
