import { type IsoScribeLogLevel, Isoscribe } from "isoscribe";

class ButteryComponentLoggers {
  InputTextDropdown: Isoscribe;
  UseInputDropdown: Isoscribe;
  UseDropdownMenu: Isoscribe;
  UseDropdownNav: Isoscribe;
  UseDropdownTooltip: Isoscribe;

  constructor(options: { defaultLevel: IsoScribeLogLevel }) {
    this.InputTextDropdown = new Isoscribe({
      name: "InputTextDropdown",
      pillColor: "#c2d600",
      logLevel: options.defaultLevel,
    });
    this.UseInputDropdown = new Isoscribe({
      name: "UseInputDropdown",
      pillColor: "#fd954b",
      logLevel: options.defaultLevel,
    });
    this.UseDropdownMenu = new Isoscribe({
      name: "useDropdownMenu",
      pillColor: "#05f7b9",
      logLevel: options.defaultLevel,
    });
    this.UseDropdownNav = new Isoscribe({
      name: "useDropdownMenu",
      pillColor: "#568afc",
      logLevel: options.defaultLevel,
    });
    this.UseDropdownTooltip = new Isoscribe({
      name: "useDropdownTooltip",
      pillColor: "#ffd36c",
      logLevel: options.defaultLevel,
    });

    if (typeof window !== "undefined") {
      window.__rhp_logs = this;
    }
  }
}

const butteryLogLevel =
  typeof window !== "undefined"
    ? undefined
    : (process.env.BUTTERY_LOG_LEVEL as IsoScribeLogLevel | undefined);

export const LOG = new ButteryComponentLoggers({
  defaultLevel:
    butteryLogLevel ??
    (process.env.NODE_ENV === "development" ? "debug" : "error"),
});
