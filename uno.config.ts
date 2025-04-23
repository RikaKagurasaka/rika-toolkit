// uno.config.ts
import { defineConfig, presetWind3, transformerDirectives } from "unocss";

export default defineConfig({
  presets: [presetWind3()],
  transformers: [transformerDirectives()],
  shortcuts: {
    btn: "rounded-md px-4 py-2",
    "btn-sm": "rounded-md px-2 py-1",
    "btn-primary": "bg-blue-600 dark:bg-blue-400 text-white",
  },
  theme: {
    colors: {
      'chord-0d': '#c5b5a5',
      'chord-1d': '#aa9988',
      'chord-2d': '#ff6080',
      'chord-3d': '#17ab39',
      'chord-4d': '#aa88ee',
      'chord-5d': '#ffaa00',

    }
  }
});
