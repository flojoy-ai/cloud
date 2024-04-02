# Cloud Glossary

## Terminology

### Definition - The `User` perspective

| Inventory            | Definition                                                             | Example                                             | Unique Identifier  |
|:---------------------|:-----------------------------------------------------------------------|:----------------------------------------------------|:-------------------|
| **Product**          | A completed item to be manufactured                                    | Raspberry Pi 5                                      | Product Id → _PI-5_|
| **Part**             | A design of a component that is tested                                 | CPU Broadcom 64-bit quad-core Arm Cortex-A76 processor | Part Number → _CPU-BCM2712_   |
| **Unit**             | A concrete instance of a part                                          | The CPU in your Raspberry Pi 5 that you have       | Serial Number → _SN-BCM2712-01253_  |
| **Sub-assembly**     | A set of parts that are required to make another part                  | To build a Pi-5, we need the CPU, Board, RAM, I/O, ... | N/A |

| Testing                | Definition                                                                                                       |
|:-----------------------|:-----------------------------------------------------------------------------------------------------------------|
| **Production Line**    | Where a product is being assembled and the test stations are located.                                            |
| **Test Station**       | A physical space on a manufacturing line where tests and measurements are performed on an instance of a part.    |
| **Test Session**       | A group of tests that are performed at the same time, at the same test station, by the same operator.            |
| **Test / Measurement** | A single measurement or action with an expected and obtain value. (The simplest element with `pass` or `fail`)   |

---

### Definition - The `Developer` perspective

To formally describe the relation between parts, slight but **important** adjustments are needed.

| Term              | Difference                                                                                                |
|:------------------|:----------------------------------------------------------------------------------------------------------|
| **Product**       | Can be seen as a tag to group parts together, helping the user understand in which final product this part goes. |
| **Part**          | Split into two categories: `part` and `part_variation` to represent the possible relation between the parts, described below | 
| **Unit**          | None                                                                                                      |
| **Sub-assembly**  | A sub-assembly is a set of `part_variation`.                                                              |

Precision: 
- There can exist multiple variations and revisions of a part, all with their unique Part Number, but starting with the same root (e.g., _PCB-CTR065-001_, _PCB-CTR065-002_, _PCB-CTR065-002V2_).
  - Thus, the `Part variation` is introduced, representing a specific version of a part. (For the part _PCB-CTR065_, a variant is _PCB-CTR065-001_.)
  - To save the relation between those parts, the information is split into two different database tables: e.g., `part` and `part_variant`.
  - **Unit** can thus only be an instance of a `part_variant`. (And the final **Product** in the user perspective also needs its part and its variant to create a final unit)

## Example

```txt
Workspace: Raspberry Pi
Product: Raspberry Pi 5
Part: Pi-5
Part variation of Pi-5: Pi-5-8GB
  Sub-assembly of Pi-5-8GB
    |_ RAM-8GB
    |_ CPU-1234
    |_ Memory-abcd
Part variation of Pi-5: Pi-5-4GB
  Sub-assembly of Pi-5-4GB
    |_ RAM-4GB
    |_ CPU-1234
    |_ Memory-abcd
Unit: Raspberry Pi Pico 8GB RSP-PI-001
```
