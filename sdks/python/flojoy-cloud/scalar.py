from flojoy_cloud import FlojoyCloud

client = FlojoyCloud(
    workspace_secret="eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyX3FqbTYwYXFmeXA2bTFkNWoydmMzMGQ5eCIsIndvcmtzcGFjZUlkIjoid29ya3NwYWNlX3ZvZ3I2enljMzB5MTF6MWltNGE5N2UwOSIsImlhdCI6MTcwNzc3Mzc3NH0.s-l_ogxEWEtCNold4VQdPpMq_vadojhLRlUZMc9z1ds",
    api_url="http://localhost:3000/api/v1",
)

hardwares = [
    "hardware_l99259bx2bvfl8bpx24u4xl2",
    "hardware_h42amqup5l8ej8p1ffwpw9og",
    "hardware_i9ybcvm9f291bu623i4a4rwi",
    "hardware_nwknwxpbjuasd9rrqfqc0zmn",
    "hardware_f6zkcysx4ufllneuati13aym",
    "hardware_we2z6phn3lwm3ppiqq1ytnew",
    "hardware_xtqu2pg33sw2glt84kydsj7b",
    "hardware_e6pd8vhx4s9adot03hcwxhyf",
    "hardware_nwwuybrrvyqbsiu2bbxprubq",
]

for num, id in enumerate(hardwares):
    client.upload(num, hardware_id=id, test_id="test_fd0tl3l5mju07v88xx3juas2")
