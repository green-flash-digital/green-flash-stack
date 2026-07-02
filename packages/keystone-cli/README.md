# keystone-css

The CLI for [`@keystone-css/core`](../core/README.md).

```sh
npm install -g keystone-css
```

---

## Commands

```sh
keystone build     # generate CSS custom properties and typed utilities
keystone dev       # build + watch mode
keystone studio    # launch the interactive token studio
keystone add       # scaffold new .keystone/ assets
```

## How it works

`keystone-css` reads your `.keystone/config.ts`, runs the build pipeline from `@keystone-css/core`, and writes the generated files into `.keystone/_generated/`. See the [`@keystone-css/core` README](../core/README.md) for the full token definition API and customization options.

---

## License

MIT
