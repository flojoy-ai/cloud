from typing import Literal

import pandas as pd

MeasurementData = bool | pd.DataFrame
MeasurementType = Literal["boolean", "dataframe"]


def make_payload(data: MeasurementData):
    match data:
        case bool():
            return {"type": "boolean", "value": data}
        case pd.DataFrame():
            value = {}
            # Have to do this weird hack because df.todict('list') behaves strangely
            for col_name, series in data.items():
                value[col_name] = series.tolist()

            return {"type": "dataframe", "value": value}
        case _:
            raise TypeError(f"Unsupported data type: {type(data)}")
