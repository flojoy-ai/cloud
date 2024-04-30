from typing import Any, Literal
from pydantic import BaseModel, field_validator

import pandas as pd

MeasurementData = bool | pd.DataFrame | int | float
MeasurementType = Literal["boolean", "dataframe", "scalar"]


class ScalarData(BaseModel):
    type: Literal["scalar"]
    value: int | float


class BooleanData(BaseModel):
    type: Literal["boolean"]
    value: bool


class DataframeData(BaseModel):
    type: Literal["dataframe"]
    value: pd.DataFrame

    @field_validator("value")
    @classmethod
    def deserialize_df(cls, v: dict[str, Any]):
        return pd.DataFrame.from_dict(v)


def make_payload(data: MeasurementData, unit: str | None = None):
    match data:
        case bool():
            return {"type": "boolean", "value": data}
        case pd.DataFrame():
            value = {}
            # Have to do this weird hack because df.todict('list') behaves strangely
            for col_name, series in data.items():
                value[col_name] = series.tolist()

            return {"type": "dataframe", "value": value}
        case int() | float():
            meas = {"type": "scalar", "value": data}
            if unit is not None:
                meas["unit"] = unit
            return meas
        case _:
            raise TypeError(f"Unsupported data type: {type(data)}")
