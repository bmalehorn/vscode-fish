// Copyright (c) 2025 Brian Malehorn
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

"use strict";

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { execFileSync } from "child_process";
import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

const CONFIG_SECTION = "fish.lsp";
const ENABLE_SETTING = `${CONFIG_SECTION}.enable`;
const PATH_SETTING = `${CONFIG_SECTION}.path`;
const EXTRA_ARGS_SETTING = `${CONFIG_SECTION}.extraArgs`;

let activeClient: LanguageClient | undefined;

export const isFishLspEnabled = (): boolean => {
  const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);
  return configuration.get<boolean>("enable", true);
};

export const startFishLanguageClient = async (
  context: vscode.ExtensionContext,
): Promise<LanguageClient | undefined> => {
  if (activeClient || !isFishLspEnabled()) {
    return activeClient;
  }

  const launch = await resolveFishLspLaunch(context);
  if (!launch) {
    return undefined;
  }

  const serverOptions: ServerOptions = {
    run: launch,
    debug: launch,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { language: "fish", scheme: "file" },
      { language: "fish", scheme: "untitled" },
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.fish"),
    },
    outputChannelName: "Fish Language Server",
  };

  const client = new LanguageClient(
    "fishLanguageServer",
    "Fish Language Server",
    serverOptions,
    clientOptions,
  );

  context.subscriptions.push(client);
  await client.start();
  activeClient = client;

  return client;
};

export const stopFishLanguageClient = async (): Promise<void> => {
  if (!activeClient) {
    return;
  }

  const client = activeClient;
  activeClient = undefined;
  await client.stop();
  client.dispose();
};

export const restartFishLanguageClient = async (
  context: vscode.ExtensionContext,
): Promise<void> => {
  await stopFishLanguageClient();
  if (isFishLspEnabled()) {
    await startFishLanguageClient(context);
  }
};

const resolveFishLspLaunch = async (
  context: vscode.ExtensionContext,
): Promise<Executable | undefined> => {
  const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const explicitPath = configuration.get<string>("path")?.trim();
  const command =
    explicitPath || resolveBundledFishLspPath(context) || "fish-lsp";

  if (!explicitPath && command === "fish-lsp" && !isExecutableOnPath(command)) {
    await vscode.window.showWarningMessage(
      "fish-lsp executable not found. Install fish-lsp or configure 'fish.lsp.path' to enable language server features.",
    );
    return undefined;
  }

  if (explicitPath && !fs.existsSync(explicitPath)) {
    await vscode.window.showWarningMessage(
      `fish-lsp executable not found at configured path: ${explicitPath}`,
    );
    return undefined;
  }

  const extraArgsSetting = configuration.get<unknown>("extraArgs");
  const extraArgs = Array.isArray(extraArgsSetting)
    ? extraArgsSetting.filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  const sanitizedArgs = extraArgs.filter((arg) => arg !== "start");

  const args = ["start", "--stdio"];
  args.push(...sanitizedArgs);

  const launch: Executable = {
    command,
    args,
    options: { env: process.env },
  };

  return launch;
};

const resolveBundledFishLspPath = (
  context: vscode.ExtensionContext,
): string | undefined => {
  try {
    const resolved = require.resolve("fish-lsp/dist/fish-lsp");
    return resolved;
  } catch (error) {
    const candidate = context.asAbsolutePath(
      path.join("node_modules", "fish-lsp", "dist", "fish-lsp"),
    );
    // NOTE: using the sync methods here might make this extension have a slow startup time.
    // Ideally, this location and execFileSync would use async methods, and propagate
    // that up the the caller.
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
};

const isExecutableOnPath = (binary: string): boolean => {
  try {
    const which = process.platform === "win32" ? "where" : "which";
    execFileSync(which, [binary], { stdio: "ignore" });
    return true;
  } catch (_error) {
    return false;
  }
};

export const watchedFishLspSettings = (): string[] => [
  ENABLE_SETTING,
  PATH_SETTING,
  EXTRA_ARGS_SETTING,
];
