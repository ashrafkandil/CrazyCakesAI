import path from "node:path";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  // Expose VITE_* vars from .env files as import.meta.env.*
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine = Object.fromEntries(
    Object.entries(loadedEnv).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value),
    ]),
  );

  const plugins: PluginOption[] = [
    tailwindcss(),
    // Redirect Ashraf Kandil's bundled server entry to src/server.ts (our SSR error wrapper).
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
  ];

  // Bundle the SSR server for deployment with Nitro (build only).
  // `node` preset -> run locally with: node .output/server/index.mjs
  if (command === "build") {
    plugins.push(nitro({ defaultPreset: "node" }));
  }

  return {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      tsconfigPaths: true,
      alias: { "@": path.resolve(process.cwd(), "src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    plugins,
    server: { host: "::", port: Number(process.env["PORT"]) || 3000 },
  };
});
