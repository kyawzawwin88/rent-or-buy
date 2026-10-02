import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

function commandOnPath(command: string): boolean {
  try {
    execFileSync("/usr/bin/which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function editorCommand(): string | undefined {
  if (process.env.LAUNCH_EDITOR) {
    return process.env.LAUNCH_EDITOR;
  }
  return ["cursor", "code"].find(commandOnPath);
}

function storyFile(file: string): string {
  const bare = file.replace(/:\d+(?::\d+)?$/, "");
  return isAbsolute(bare) ? bare : resolve(process.cwd(), bare);
}

const editor = editorCommand();
if (editor) {
  process.env.LAUNCH_EDITOR = editor;
}

function openStoryInEditor(payload: { file?: string; line?: number; column?: number }): void {
  if (!payload.file || !editor) {
    return;
  }
  const file = storyFile(payload.file);
  if (!existsSync(file)) {
    return;
  }
  const line = payload.line ?? 1;
  const column = payload.column ?? 1;
  const child = spawn(editor, ["-r", "-g", `${file}:${line}:${column}`], {
    stdio: "ignore",
    detached: true,
  });
  child.unref();
}

function pluginName(plugin: PluginOption): string {
  if (plugin && typeof plugin === "object" && "name" in plugin && typeof plugin.name === "string") {
    return plugin.name;
  }
  return "";
}

const config: StorybookConfig = {
  stories: ["../**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(config) {
    config.esbuild ??= {};
    config.esbuild.jsx = "automatic";
    config.plugins = (config.plugins ?? []).flat().filter((plugin) => !pluginName(plugin).includes("remix"));
    return config;
  },
  async experimental_serverChannel(channel: {
    on: (
      event: string,
      handler: (payload: { file?: string; line?: number; column?: number }) => void,
    ) => void;
  }) {
    channel.on("openInEditorRequest", openStoryInEditor);
    return channel;
  },
};

export default config;
