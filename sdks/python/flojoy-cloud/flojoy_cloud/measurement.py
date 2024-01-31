from typing import Literal

import pandas as pd

MeasurementData = bool | pd.DataFrame
MeasurementType = Literal["boolean", "dataframe"]


def make_payload(data: MeasurementData):
    match data:
        case bool():
            return {"type": "boolean", "value": data}
        case pd.DataFrame():
            return {
                "type": "dataframe",
                "value": data.to_dict("list"),
            }
        case _:
            raise TypeError(f"Unsupported data type: {type(data)}")
