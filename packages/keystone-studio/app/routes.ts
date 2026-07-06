import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/login.tsx"),
  route("projects", "routes/projects.tsx"),
  layout("routes/layout.tsx", [
    index("routes/index.tsx"),
    route("config", "routes/config/layout.tsx", [
      index("routes/config/color.tsx"),
      route("size-and-spacing", "routes/config/size-and-spacing.tsx"),
      route("typography", "routes/config/typography.tsx"),
      route("response", "routes/config/response.tsx"),
      route("custom", "routes/config/custom.tsx"),
      route("settings", "routes/config/settings.tsx")
    ]),
    route("api/save-config", "routes/api/save-config.ts")
  ])
] satisfies RouteConfig;
