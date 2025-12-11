const ANSI_COLORS = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  redBright: "\x1b[91m",
  greenBright: "\x1b[92m",
  yellowBright: "\x1b[93m",
  blueBright: "\x1b[94m",
  magentaBright: "\x1b[95m",
  cyanBright: "\x1b[96m",
  whiteBright: "\x1b[97m",
} as const;

const ANSI_STYLES = {
  bold: "\x1b[1m",
  underline: "\x1b[4m",
  bg: "\x1b[7m",
} as const;

const RESET = "\x1b[0m";

type Colors = keyof typeof ANSI_COLORS;
type Styles = keyof typeof ANSI_STYLES;

class Colorizer {
  private _color?: string;
  private _styles: string[] = [];

  constructor(parent?: Colorizer, color?: Colors, style?: Styles) {
    if (parent) {
      this._color = parent._color;
      this._styles = [...parent._styles]; // Preserve styles
    }
    if (color) this._color = ANSI_COLORS[color];
    if (style) this._styles.push(ANSI_STYLES[style]);

    this.createColorMethods();
    this.createStyleMethods();
  }

  private createColorMethods() {
    (Object.keys(ANSI_COLORS) as Colors[]).forEach((color) => {
      (this as any)[color] = () => {
        this._color = ANSI_COLORS[color];
        return this;
      };
    });
  }

  private createStyleMethods() {
    (Object.keys(ANSI_STYLES) as Styles[]).forEach((style) => {
      (this as any)[style] = () => {
        this._styles.push(ANSI_STYLES[style]);
        return this;
      };
    });
  }

  private format(text: string): string {
    return `${this._styles.join("")}${this._color ?? ""}${text}${RESET}`;
  }

  private callable = (text: string) => this.format(text);
}

type ColorizerInstance = {
  [key in Colors | Styles]: ColorizerInstance;
} & ((text: string) => string);

const createColorizerProxy = (
  parent?: Colorizer,
  color?: Colors,
  style?: Styles
) => {
  // 🔥 This function actually gets called when you invoke `c("text")`
  function applyColorizer(text: string) {
    return new Colorizer(parent, color, style)["callable"](text);
  }

  return new Proxy(applyColorizer, {
    // 🔹 Handle property access (e.g., `c.red`, `c.underline`)
    get(_, prop: string) {
      if (prop in ANSI_COLORS) {
        return createColorizerProxy(new Colorizer(parent, prop as Colors));
      }
      if (prop in ANSI_STYLES) {
        return createColorizerProxy(
          new Colorizer(parent, undefined, prop as Styles)
        );
      }
      return undefined;
    },
    // 🔹 Handle function calls (e.g., `c("Hello")`)
    apply(target, _, args) {
      return target(args[0]); // Calls `applyColorizer(text)`, which formats the string
    },
  });
};

// ✅ `c` is now a function-proxy hybrid that supports both method chaining and function calls
export const c = createColorizerProxy() as ColorizerInstance;
