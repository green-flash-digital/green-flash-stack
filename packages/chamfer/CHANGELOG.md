# buttery-tokens

## 0.3.6

### Patch Changes

- ce972e7: Fixes issue where the font family name was being replaced with the token name in the generated CSS
- Updated dependencies [ce972e7]
  - @buttery/core@0.3.6
  - @buttery/studio@0.3.6

## 0.3.5

### Patch Changes

- b770433: Fixes known issue where CSS custom properties cannot be used with media queries
- Updated dependencies [b770433]
  - @buttery/core@0.3.5
  - @buttery/studio@0.3.5

## 0.3.4

### Patch Changes

- 4a50d65: Adds required dependencies to support yarn pnp
- Updated dependencies [4a50d65]
  - @buttery/core@0.3.4
  - @buttery/studio@0.3.4

## 0.3.3

### Patch Changes

- cefc1f2: Upgrades dependencies
- Updated dependencies [cefc1f2]
  - @buttery/core@0.3.3
  - @buttery/studio@0.3.3

## 0.3.2

### Patch Changes

- 2165fb3: Upgrades dependencies
- Updated dependencies [2165fb3]
  - @buttery/core@0.3.2
  - @buttery/studio@0.3.2

## 0.3.1

### Patch Changes

- b79f6d7: Adds required dependencies to transiple tokens library at runtime
- Updated dependencies [b79f6d7]
  - @buttery/core@0.3.1
  - @buttery/studio@0.3.1

## 0.3.0

### Minor Changes

- 25636c2: Adds option to be able to package the \_generated folder into a library for distribution

### Patch Changes

- Updated dependencies [25636c2]
  - @buttery/core@0.3.0
  - @buttery/studio@0.3.0

## 0.2.6

### Patch Changes

- a49dfb7: Re-enables sticky scrolling in studio
- Updated dependencies [a49dfb7]
  - @buttery/core@0.2.6
  - @buttery/studio@0.2.6

## 0.2.5

### Patch Changes

- 6b49d5f: Adds StudioServer to studio ouput files
- Updated dependencies [6b49d5f]
  - @buttery/core@0.2.5
  - @buttery/studio@0.2.5

## 0.2.4

### Patch Changes

- 3c43de6: Adds `fizmoo` as production dependency to resolve runtime
- Updated dependencies [3c43de6]
  - @buttery/core@0.2.4
  - @buttery/studio@0.2.4

## 0.2.3

### Patch Changes

- 20501e9: Adds public publish configuration to all packages
- Updated dependencies [20501e9]
  - @buttery/core@0.2.3
  - @buttery/studio@0.2.3

## 0.2.2

### Patch Changes

- e46ee96: Bug fixes
- Updated dependencies [e46ee96]
  - @buttery/core@0.2.2
  - @buttery/studio@0.2.2

## 0.2.1

### Patch Changes

- ba7f3cc: Refactors the entire repository to break out out of the original buttery tools. This PR consolidates all of the disparate functions into a singular `ButteryTokens` class that is then used to expose an API to create and develop tokens. In addition, this API is used in a CLI created with `fizmoo`.
- Updated dependencies [ba7f3cc]
  - @buttery/core@0.2.1
  - @buttery/studio@0.2.1
