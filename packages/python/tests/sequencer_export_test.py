from flojoy_cloud import test_sequencer
from random import randint, random
import pandas as pd
import os
import shutil
import pytest


def test_no_output():
    output_dir, prefix_file = test_sequencer.__get_location()
    # delete the dir if it exists
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    # Try to get the most recent data
    data = test_sequencer._get_most_recent_data(prefix_file)
    assert data is None


def test_set_output():
    # Set the output location to simulate a test run in the test sequencer
    test_id = f"my_test_id_{randint(0,1000)}"
    test_sequencer._set_output_loc(test_id)

    # Simulate user export
    my_value = randint(0, 1000)
    test_sequencer.export(my_value)

    # Change the output to default
    new_test_id = f"my_test_id_{randint(1001,2000)}"
    test_sequencer._set_output_loc(new_test_id)
    my_new_value = randint(0, 1000)
    test_sequencer.export(my_new_value)

    # Verify nothing was been lost
    data = test_sequencer._get_most_recent_data(test_id)
    assert data == my_value

    data = test_sequencer._get_most_recent_data(new_test_id)
    assert data == my_new_value


def test_multiple_data_export():
    """Only the lastest should be retreive"""
    test_id = f"my_test_id_{randint(0,1000)}"
    test_sequencer._set_output_loc(test_id)

    # Simulate user export
    my_value = randint(0, 1000)
    test_sequencer.export(my_value)
    df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
    test_sequencer.export(df)
    my_new_value = randint(0, 1000)
    test_sequencer.export(my_new_value)

    # Verify that the lastest data is the only one retreive
    data = test_sequencer._get_most_recent_data(test_id)
    assert data == my_new_value


def test_export_dataframe():
    test_id = f"my_test_id_{randint(0,1000)}"
    test_sequencer._set_output_loc(test_id)
    # Simulate user export
    df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
    test_sequencer.export(df)
    # Verify that the lastest data is the only one retreive
    data: pd.DataFrame = test_sequencer._get_most_recent_data(test_id)  # type: ignore
    assert data.equals(df)


def test_export_bool():
    test_id = f"my_test_id_{randint(0,1000)}"
    test_sequencer._set_output_loc(test_id)
    # Simulate user export
    test_sequencer.export(True)
    # Verify that the lastest data is the only one retreive
    data = test_sequencer._get_most_recent_data(test_id)
    assert data is True


def test_export_int():
    test_id = f"my_test_id_{randint(0,1000)}"
    test_sequencer._set_output_loc(test_id)
    # Simulate user export
    test_sequencer.export(1)
    # Verify that the lastest data is the only one retreive
    data = test_sequencer._get_most_recent_data(test_id)
    assert data == 1


def test_export_float():
    test_id = f"my_test_id_{random()}"
    test_sequencer._set_output_loc(test_id)
    # Simulate user export
    test_sequencer.export(1.0)
    # Verify that the lastest data is the only one retreive
    data = test_sequencer._get_most_recent_data(test_id)
    assert data == 1.0


def test_min_value_expected():
    test_sequencer._set_min_max(10, None)

    test_sequencer.assert_greater_than_min(11)
    with pytest.raises(Exception):
        test_sequencer.assert_greater_than_min(10)


def test_max_value_expected():
    test_sequencer._set_min_max(None, 10)

    test_sequencer.assert_less_than_max(9)
    with pytest.raises(Exception):
        test_sequencer.assert_less_than_max(10)


def test_min_max_value_expected():
    test_sequencer._set_min_max(10, 15)

    test_sequencer.assert_in_range(11)
    test_sequencer.assert_in_range(14.99)
    with pytest.raises(Exception):
        test_sequencer.assert_in_range(15.001)


def test_min_max_setter():
    test_id = f"my_test_id_{randint(0,1000)}"
    test_sequencer._set_output_loc(test_id)
    test_sequencer._set_min_max(10, 15)

    test_sequencer._set_output_loc(None)
    test_sequencer._set_min_max(None, None)
    min, max = test_sequencer.get_min_max()
    assert min is None
    assert max is None

    test_sequencer._set_output_loc(test_id)
    min, max = test_sequencer.get_min_max()
    assert min is not None and max is not None
    assert min == 10 and max == 15


def test_min_max_type():
    test_sequencer._set_min_max(10, 15.066)
    min, max = test_sequencer.get_min_max()
    assert isinstance(min, int)
    assert isinstance(max, float)
