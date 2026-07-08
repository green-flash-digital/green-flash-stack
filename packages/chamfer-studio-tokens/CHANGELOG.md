# @buttery/studio-tokens

## 0.3.6

### Patch Changes

- ce972e7: Fixes issue where the font family name was being replaced with the token name in the generated CSS

## 0.3.5

### Patch Changes

- b770433: Fixes known issue where CSS custom properties cannot be used with media queries

## 0.3.4

### Patch Changes

- 4a50d65: Adds required dependencies to support yarn pnp

## 0.3.3

### Patch Changes

- cefc1f2: Upgrades dependencies

## 0.3.2

### Patch Changes

- 2165fb3: Upgrades dependencies

## 0.3.1

### Patch Changes

- b79f6d7: Adds required dependencies to transiple tokens library at runtime

## 0.3.0

### Minor Changes

- 25636c2: Adds option to be able to package the \_generated folder into a library for distribution

## 0.2.6

### Patch Changes

- a49dfb7: Re-enables sticky scrolling in studio

## 0.2.5

### Patch Changes

- 6b49d5f: Adds StudioServer to studio ouput files

## 0.2.4

### Patch Changes

- 3c43de6: Adds `fizmoo` as production dependency to resolve runtime

## 0.2.3

### Patch Changes

- 20501e9: Adds public publish configuration to all packages

## 0.2.2

### Patch Changes

- e46ee96: Bug fixes

## 0.2.1

### Patch Changes

- ba7f3cc: Refactors the entire repository to break out out of the original buttery tools. This PR consolidates all of the disparate functions into a singular `ButteryTokens` class that is then used to expose an API to create and develop tokens. In addition, this API is used in a CLI created with `fizmoo`.
