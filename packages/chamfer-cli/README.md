# chamfer-css

The CLI for [`@chamfer-css/core`](../core/README.md).

```sh
npm install -g chamfer-css
```

---

## Commands

```sh
chamfer build     # generate CSS custom properties and typed utilities
chamfer dev       # build + watch mode
chamfer studio    # launch the interactive token studio
chamfer add       # scaffold new .chamfer/ assets
```

## How it works

`chamfer-css` reads your `.chamfer/config.ts`, runs the build pipeline from `@chamfer-css/core`, and writes the generated files into `.chamfer/_generated/`. See the [`@chamfer-css/core` README](../core/README.md) for the full token definition API and customization options.

---

## License

MIT
