// Copyright (c) 2019-2025 Brian Malehorn
// Copyright (c) 2017 Sebastian Wiesner <sebastian@swsnr.de>

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

"use strict";

import { execFile } from "child_process";
import * as vscode from "vscode";
import {
  Diagnostic,
  DocumentFormattingEditProvider,
  DocumentRangeFormattingEditProvider,
  ExtensionContext,
  Range,
  TextDocument,
  TextEdit,
  WorkspaceFolder,
} from "vscode";
import { provideCompletionItems } from "./provideCompletionItems";
import {
  isFishLspEnabled,
  restartFishLanguageClient,
  startFishLanguageClient,
  stopFishLanguageClient,
  watchedFishLspSettings,
} from "./fishLspClient";

let completionProviderRegistration: vscode.Disposable | undefined;

/**
 * Activate this extension.
 *
 * Install a formatter for fish files using fish_indent, and start linting fish
 * files for syntax errors.
 *
 * Initialization fails if Fish is not installed.
 *
 * @param context The context for this extension
 * @return A promise for the initialization
 */
export const activate = async (context: ExtensionContext): Promise<any> => {
  startLinting(context);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "fish",
      formattingEditProvider,
    ),
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      "fish",
      formattingRangeEditProvider,
    ),
  );

  refreshCompletionProvider(context);

  await startFishLanguageClient(context);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        watchedFishLspSettings().some((setting) =>
          event.affectsConfiguration(setting),
        )
      ) {
        refreshCompletionProvider(context);
        void restartFishLanguageClient(context).catch((error) => {
          console.error("Failed to restart fish language server", error);
          vscode.window.showErrorMessage(
            "Failed to restart fish language server. Check logs for details.",
          );
        });
      }
    }),
  );
};

/**
 * Start linting Fish documents.
 *
 * @param context The extension context
 */
const startLinting = (context: ExtensionContext): void => {
  const diagnostics = vscode.languages.createDiagnosticCollection("fish");
  context.subscriptions.push(diagnostics);

  const lint = async (document: TextDocument) => {
    if (isSavedFishDocument(document)) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      try {
        const conf = vscode.workspace.getConfiguration();
        const fish = conf.get<string>("fish.path.fish") || "fish";
        const result = await runInWorkspace(workspaceFolder, [
          fish,
          "-n",
          document.fileName,
        ]);
        var d = fishOutputToDiagnostics(document, result.stderr);
      } catch (error) {
        let errorString = (error as any)?.toString();
        const isFishNotFound = errorString.includes("ENOENT");
        if (isFishNotFound) {
          errorString = `Fish not found: ${errorString}. Please install Fish or configure the path to Fish using the 'fish.path.fish' setting.`;
        }
        vscode.window.showErrorMessage(errorString);
        diagnostics.delete(document.uri);
        return;
      }
      diagnostics.set(document.uri, d as Diagnostic[]);
    }
  };

  vscode.workspace.onDidOpenTextDocument(lint, null, context.subscriptions);
  vscode.workspace.onDidSaveTextDocument(lint, null, context.subscriptions);
  vscode.workspace.textDocuments.forEach(lint);

  // Remove diagnostics for closed files
  vscode.workspace.onDidCloseTextDocument(
    (d) => diagnostics.delete(d.uri),
    null,
    context.subscriptions,
  );
};

/**
 * Parse fish errors from Fish output for a given document.
 *
 * @param document The document to whose contents errors refer
 * @param output The error output from Fish.
 * @return An array of all diagnostics
 */
const fishOutputToDiagnostics = (
  document: TextDocument,
  output: string,
): ReadonlyArray<Diagnostic> => {
  const diagnostics: Array<Diagnostic> = [];
  const matches = getMatches(/^(.+) \(line (\d+)\): (.+)$/gm, output);
  for (const match of matches) {
    const lineNumber = Number.parseInt(match[2]);
    const message = match[3];

    const range = document.validateRange(
      new Range(lineNumber - 1, 0, lineNumber - 1, Number.MAX_VALUE),
    );
    const diagnostic = new Diagnostic(range, message);
    diagnostic.source = "fish";
    diagnostics.push(diagnostic);
  }
  return diagnostics;
};

/**
 * Get text edits to format a range in a document.
 *
 * @param document The document whose text to format
 * @param range The range within the document to format
 * @return A promise with the list of edits
 */
const getFormatRangeEdits = async (
  document: TextDocument,
): Promise<ReadonlyArray<TextEdit>> => {
  const conf = vscode.workspace.getConfiguration();
  const fishIndent = conf.get<string>("fish.path.fish_indent") || "fish_indent";
  try {
    var result = await runInWorkspace(
      vscode.workspace.getWorkspaceFolder(document.uri),
      [fishIndent],
      document.getText(),
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to run ${fishIndent}: ${error}`);
    // Re-throw the error to make the promise fail
    throw error;
  }
  if (result.exitCode !== 0) {
    vscode.window.showErrorMessage(
      `fish_indent failed:\n${result.stdout}\n${result.stderr}`,
    );
    return [];
  }
  return [
    new TextEdit(
      new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE),
      result.stdout,
    ),
  ];
};

const formattingEditProvider: DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits: async (document, _, token) => {
    const edits = await getFormatRangeEdits(document);
    return token.isCancellationRequested ? [] : (edits as TextEdit[]);
  },
};

const formattingRangeEditProvider: DocumentRangeFormattingEditProvider = {
  provideDocumentRangeFormattingEdits: async (document, _range, _, token) => {
    const edits = await getFormatRangeEdits(document);
    return token.isCancellationRequested ? [] : (edits as TextEdit[]);
  },
};

/**
 * Whether a given document is saved to disk and in Fish language.
 *
 * @param document The document to check
 * @return Whether the document is a Fish document saved to disk
 */
const isSavedFishDocument = (document: TextDocument): boolean =>
  !document.isDirty &&
  0 <
    vscode.languages.match(
      {
        language: "fish",
        scheme: "file",
      },
      document,
    );

/**
 * A system error, i.e. an error that results from a syscall.
 */
interface ISystemError extends Error {
  readonly errno: string;
}

/**
 * Whether an error is a system error.
 *
 * @param error The error to check
 */
const isSystemError = (error: Error): error is ISystemError =>
  (error as ISystemError).errno !== undefined &&
  typeof (error as ISystemError).errno === "string";

/**
 * A process error.
 *
 * A process error occurs when the process exited with a non-zero exit code.
 */
interface IProcessError extends Error {
  /**
   * The exit code of the process.
   */
  readonly code: number;
}

/**
 * Whether an error is a process error.
 */
const isProcessError = (error: Error): error is IProcessError =>
  !isSystemError(error) &&
  (error as IProcessError).code !== undefined &&
  (error as IProcessError).code > 0;

/**
 * The result of a process.
 */
interface IProcessResult {
  /**
   * The integral exit code.
   */
  readonly exitCode: number;
  /**
   * The standard output.
   */
  readonly stdout: string;
  /**
   * The standard error.
   */
  readonly stderr: string;
}

/**
 * Run a command in a given workspace folder.
 *
 * If the workspace folder is undefined run the command in the working directory
 * if the vscode instance.
 *
 * @param folder The folder to run the command in
 * @param command The command array
 * @param stdin An optional string to feed to standard input
 * @return The result of the process as promise
 */
const runInWorkspace = (
  folder: WorkspaceFolder | undefined,
  command: ReadonlyArray<string>,
  stdin?: string,
): Promise<IProcessResult> =>
  new Promise((resolve, reject) => {
    const cwd = folder ? folder.uri.fsPath : process.cwd();
    const file = command[0];
    const args = command.slice(1);
    const child = execFile(file, args, { cwd }, (error, stdout, stderr) => {
      if (error && !isProcessError(error)) {
        // Throw system errors, but do not fail if the command
        // fails with a non-zero exit code.
        console.error("Command error", command, error);
        reject(error);
      } else {
        const exitCode = error ? error.code : 0;
        resolve({ stdout, stderr, exitCode });
      }
    });
    if (stdin && child.stdin) {
      child.stdin.end(stdin);
    }
  });

/**
 * Exec pattern against the given text and return an array of all matches.
 *
 * @param pattern The pattern to match against
 * @param text The text to match the pattern against
 * @return All matches of pattern in text.
 */
const getMatches = (
  pattern: RegExp,
  text: string,
): ReadonlyArray<RegExpExecArray> => {
  const results = [];
  // We need to loop through the regexp here, so a let is required
  let match = pattern.exec(text);
  while (match !== null) {
    results.push(match);
    match = pattern.exec(text);
  }
  return results;
};

function refreshCompletionProvider(context: ExtensionContext): void {
  completionProviderRegistration?.dispose();
  completionProviderRegistration = undefined;

  if (isFishLspEnabled()) {
    return;
  }

  completionProviderRegistration = vscode.languages.registerCompletionItemProvider(
    "fish",
    {
      provideCompletionItems,
    },
  );
  context.subscriptions.push(completionProviderRegistration);
}

export const deactivate = async (): Promise<void> => {
  completionProviderRegistration?.dispose();
  completionProviderRegistration = undefined;
  await stopFishLanguageClient();
};
