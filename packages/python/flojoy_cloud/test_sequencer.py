import logging
import os
import shutil
import tempfile
from typing import Tuple

import pandas as pd
from pydantic import BaseModel

from .measurement import MeasurementData

ExpectedMeasurementType = int | float


class ExpectedMeasurement(BaseModel):
    min: ExpectedMeasurementType | None = None
    max: ExpectedMeasurementType | None = None


# ------ Public ------

__all__ = [
    "export",
    "is_in_range",
    "_get_most_recent_data",
    "_set_output_loc",
]


def export(data: MeasurementData):
    """Export data so it can be retrieved by the test sequencer"""
    output_dir, prefix_file = __get_location()
    if isinstance(data, pd.DataFrame):
        data.to_csv(os.path.join(output_dir, prefix_file + DATAFRAME))
    elif isinstance(data, bool):
        with open(os.path.join(output_dir, prefix_file + BOOLEAN), "w") as f:
            f.write(str(data))
    elif isinstance(data, int):
        with open(os.path.join(output_dir, prefix_file + INT), "w") as f:
            f.write(str(data))
    elif isinstance(data, float):
        with open(os.path.join(output_dir, prefix_file + FLOAT), "w") as f:
            f.write(str(data))
    else:
        raise TypeError(f"Unsupported data type: {type(data)}")


def is_in_range(data: ExpectedMeasurementType):
    """Assert that the data is within the min and max values"""
    min, max = get_min_max()
    if min is not None and max is not None:
        return min <= data <= max
    elif min is not None:
        return min <= data
    elif max is not None:
        return data <= max
    raise ValueError("Min and max values not set")


def get_min_max() -> (
    Tuple[ExpectedMeasurementType | None, ExpectedMeasurementType | None]
):
    output_dir, postfix_file = __get_location()
    min_max_file = os.path.join(output_dir, f"min_max_{postfix_file}.json")
    if os.path.exists(min_max_file):
        with open(min_max_file, "r") as f:
            data = ExpectedMeasurement.model_validate_json(f.read())
            return data.min, data.max
    logging.warn("Min and max values not found")
    return None, None


# ------ Protected ------


def _set_min_max(
    min_val: ExpectedMeasurementType | None, max_val: ExpectedMeasurementType | None
):
    """
    Set the min and max values for a test from within the test sequencer.
     - The use of `_set_output_loc` prior to calling this is highly recommended.
    """
    output_dir, postfix_file = __get_location()
    min_max_file = os.path.join(output_dir, f"min_max_{postfix_file}.json")
    data = {"min": min_val, "max": max_val}
    with open(min_max_file, "w") as f:
        f.write(ExpectedMeasurement(**data).model_dump_json())
        logging.info(f"Min and max values set to {min_max_file}")


def _get_most_recent_data(
    test_id: str | None, rm_file: bool = False
) -> MeasurementData | None:
    """
    Retrieves the most recent data produced in a test run from within the test sequencer.
    Parameters:
        - test_id (str | None): The prefix used to find the data files. If None, the default prefix is used.
        - rm_file (bool): If True, the file is removed after being read.
    """
    if test_id is not None:
        _set_output_loc(test_id)

    output_dir, prefix_file = __get_location()
    output_file = __get_most_recent_file(output_dir, prefix_file)

    if output_file is None:
        return None

    if rm_file:
        os.remove(output_dir + output_file)

    return __extract_data(output_dir + output_file)


def _set_output_loc(prefix: str | None, rm_existing_data: bool = False):
    """
    Set the output location for the data when launching a test in the test sequencer.
    @prefix: The prefix to use for the data files and directory.
    - If None, the default prefix is used.
    @rm_existing_data: If True, all existing data in the output directory is deleted.
    - Warning: If the prefixis None, everything is deleted.

    """
    if prefix is not None:
        os.environ[OPTIONAL_NAME_ENV] = prefix
    else:
        os.environ.pop(OPTIONAL_NAME_ENV)
    if rm_existing_data:
        _nuke_output_loc()


def _nuke_output_loc():
    """
    Delete data files in the output directory.
    - Warning: If the output loc is not set, everything is deleted
    """
    output_dir, _ = __get_location()
    if not os.path.exists(output_dir):
        return
    shutil.rmtree(output_dir)


# ------ Private ------


DEFAULT_PATH = os.path.join(tempfile.gettempdir(), "flojoy/")
OPTIONAL_PATH_ENV = "FLOJOY_DATA_PATH"
DEFAULT_NAME = "output"
OPTIONAL_NAME_ENV = "FLOJOY_DATA_NAME"

DATAFRAME = "_dataframe.csv"
BOOLEAN = "_boolean.txt"
INT = "_int.txt"
FLOAT = "_float.txt"


def __get_location():
    output_dir = DEFAULT_PATH
    prefix_file = os.environ.get(OPTIONAL_NAME_ENV)
    output_dir = os.path.join(output_dir, f"{prefix_file}/")
    if prefix_file is None:
        prefix_file = DEFAULT_NAME
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    return output_dir, prefix_file


def __get_most_recent_file(output_dir: str, prefix_file: str):
    most_recent_file = None
    most_recent_time = 0
    if not os.path.exists(output_dir):
        return None
    for file in os.listdir(output_dir):
        if file.startswith(prefix_file):
            file_path = os.path.join(output_dir, file)
            file_time = os.path.getmtime(file_path)
            if file_time > most_recent_time:
                most_recent_time = file_time
                most_recent_file = file

    return most_recent_file


def __extract_data(path: str):
    if path.endswith(DATAFRAME):
        return pd.read_csv(path, index_col=0)
    if path.endswith(BOOLEAN):
        with open(path, "r") as f:
            str_bool = f.read().strip().lower()
            return str_bool == "true" or str_bool == "1"
    if path.endswith(INT):
        return int(open(path, "r").read())
    if path.endswith(FLOAT):
        return float(open(path, "r").read())
    raise TypeError("Unknown file type")
