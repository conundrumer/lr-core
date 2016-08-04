# lr-core

This repository contains the core libary for Line Rider:

- `LineRiderEngine`: Backwards compatible physics engine for Line Rider

Some helper libraries:

- `V2`: simple 2d vectors
- `G2`: geometry helpers
- `Immo`: Immutable Manually Managed Objects
- `OrderedObjectArray`: A collection for sorted objects in an array
- `LineEngine`: A framework for deterministic grid-based physics engines with efficient recomputation
- `LineSpace`: A data structure for efficient spatial querying of lines

And some utility functions:

- `dda`: digital differential analyzer (draws a line using pixels) for floating point coordinates
- `hashNumberPair`: functions that map every pair of integers to a unique integer

These libraries are located in `src`, along with their corresponding tests.

## Usage

See `src/line-rider-engine.spec.js`

## Build

1. `npm install`
2. `make`

This transpiles the source files from es6 into whatever can be run natively in your version of node. The built files will be located in `build`

## Test

`make test`

Test results are put into `test-results`.
