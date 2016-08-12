# lr-core

This repository contains the core libary for Line Rider:

- `line-rider-engine`: Backwards compatible physics engine for Line Rider

Some helper libraries:

- `v2`: simple 2d vectors
- `g2`: geometry helpers
- `immo`: Immutable Manually Managed Objects
- `ordered-object-array`: A collection for sorted objects in an array
- `line-engine`: A framework for deterministic grid-based physics engines with efficient recomputation
- `line-space`: A data structure for efficient spatial querying of lines

And some utility functions in `utils`:

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
