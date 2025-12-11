# ts-jolt Changelog

## v0.2.3

2025-04-22

### 🐛 Fixed

- Removes the comments from the tsconfigs to ensure they can be imported as raw json

## v0.2.2

2025-02-21

### 🐛 Fixed

- Removes the comments from the tsconfigs to ensure they can be imported as raw json

## v0.2.1

2025-02-21

### 🐛 Fixed

- Adds the `tsconfig/library-next` export to the `package.json`

## v0.2.0

2025-02-21

### 🚀 Added

- Adds `TempFile` to the node utils to be able to easily create and cleanup temporary files
- Adds another `tsconfig` that requires NodeNext as the `nodeResolution` setting

## v0.1.0

2025-02-21

### 🚀 Added

- Adds all of the utils necessary from the `buttery-tools` package
- Adds unit tests and a testing script to be able to be tested and built in CI
- Adds CI / CD automation scripts for GitHub Actions
