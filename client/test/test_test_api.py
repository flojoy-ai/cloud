# coding: utf-8

"""
    Flojoy Cloud API

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest

from openapi_client.api.test_api import TestApi


class TestTestApi(unittest.TestCase):
    """TestApi unit test stubs"""

    def setUp(self) -> None:
        self.api = TestApi()

    def tearDown(self) -> None:
        pass

    def test_test_create_test(self) -> None:
        """Test case for test_create_test

        """
        pass

    def test_test_get_all_tests_by_project_id(self) -> None:
        """Test case for test_get_all_tests_by_project_id

        """
        pass

    def test_test_get_test_by_id(self) -> None:
        """Test case for test_get_test_by_id

        """
        pass


if __name__ == '__main__':
    unittest.main()
