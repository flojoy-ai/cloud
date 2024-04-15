# from pathlib import Path
# from typing import Callable
#
# import pandas as pd
# from rich.console import Console
# from watchfiles import Change, watch
#
# from flojoy_cloud import FlojoyCloud, MeasurementData
# from dataclasses import dataclass
#
#
# class InvalidExtension(Exception):
#     pass
#
#
# @dataclass
# class CloudData:
#     data: MeasurementData
#     passed: bool | None = None
#     name: str | None = None
#
#
# Handler = Callable[[str], CloudData]
#
#
# def handle_csv(path: str):
#     return CloudData(data=pd.read_csv(path), passed=None)
#
#
# def handle_json(path: str):
#     return CloudData(data=pd.read_json(path), passed=None)
#
#
# def handle_parquet(path: str):
#     return CloudData(data=pd.read_parquet(path), passed=None)
#
#
# def handle_feather(path: str):
#     return CloudData(data=pd.read_feather(path), passed=None)
#
#
# DEFAULT_HANDLERS: dict[str, Handler] = {
#     ".csv": handle_csv,
#     ".json": handle_json,
#     ".parquet": handle_parquet,
#     ".feather": handle_feather,
# }
#
#
# def start_watch(
#     path: str,
#     client: FlojoyCloud,
#     *,
#     test_id: str,
#     hardware_id: str,
#     handlers: dict[str, Handler] = {},
#     quiet: bool = False,
# ):
#     watch_path = Path(path)
#     if not watch_path.exists():
#         raise FileNotFoundError(f"Path '{watch_path}' does not exist")
#     handlers = DEFAULT_HANDLERS | handlers
#
#     console = Console(quiet=quiet)
#     console.log("[green]Watching for new files...[/green]")
#
#     for changes in watch(watch_path):
#         for change, path in changes:
#             if change != Change.added:
#                 continue
#             console.log(f"Found new file [italic green]{path}[/italic green]")
#             try:
#                 res = handle_file(path, handlers)
#                 console.log("[cyan2]Uploading data to Flojoy Cloud.[/cyan2]")
#                 upload_res = client.upload(
#                     res.data,
#                     test_id=test_id,
#                     hardware_id=hardware_id,
#                     passed=res.passed,
#                     name=res.name,
#                 )
#                 console.log(
#                     f"[cyan2]Data uploaded successfully to {upload_res.id}.[/cyan2]"
#                 )
#             except Exception as e:
#                 console.log(f"[bold red]{e}[/bold red]")
#
#
# def handle_file(path: str, handlers: dict[str, Handler]):
#     p = Path(path)
#     handler = handlers.get(p.suffix)
#     if handler is None:
#         raise InvalidExtension(f"Unsupported file type {p.suffix}")
#
#     return handler(path)
