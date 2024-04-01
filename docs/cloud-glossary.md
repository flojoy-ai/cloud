# Cloud Glossary

## Inventory

### Product

A completed item to be manufactured. (e.g. "Raspberry Pi 5")

#### Part

A part is hardware component that is tested. (e.g. "Pi-5")

- Part variation: a specific version of a part. (e.g. "Pi-5-8GB")

- Sub-assembly: essentially a part variation made up of other part variations.
  (e.g. The "Pi-5-8GB"'s sub-assembly can include,
  "RAM-8GB", "CPU-1234", "Memory-abcd", etc.)

#### Hardware

This is a concrete instance of a part variation (including assembly which is basically
a part variation). (e.g. "Raspberry Pi 5 8GB RSP-PI-001")

## Production Line

Where your product is being assembled and your part test stations are located.

### Test Station

A physical space on your manufacturing line where tests and measurements are
performed on an instance of a part.

#### Test Session

A group of tests that are performed at the same time, at the same test station,
by the same operator.

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
