// Copyright (c) 2019 Brian Malehorn
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

const x: number = "";

import { execFile } from "child_process";
import { homedir } from "os";
import * as vscode from "vscode";
import {
  Diagnostic,
  DocumentFormattingEditProvider,
  DocumentRangeFormattingEditProvider,
  ExtensionContext,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  WorkspaceFolder,
} from "vscode";

/**
 * Expand a leading tilde to $HOME in the given path.
 *
 * @param path The path to expand
 */
const expandUser = (path: string): Uri =>
  Uri.file(path.replace(/^~($|\/|\\)/, `${homedir()}$1`));

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
    const child = execFile(
      command[0],
      command.slice(1),
      { cwd },
      (error, stdout, stderr) => {
        if (error && !isProcessError(error)) {
          // Throw system errors, but do not fail if the command
          // fails with a non-zero exit code.
          console.error("Command error", command, error);
          reject(error);
        } else {
          const exitCode = error ? error.code : 0;
          resolve({ stdout, stderr, exitCode });
        }
      },
    );
    if (stdin) {
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
  // tslint:disable-next-line:readonly-array
  const results = [];
  // We need to loop through the regexp here, so a let is required
  // tslint:disable-next-line:no-let
  let match = pattern.exec(text);
  while (match !== null) {
    results.push(match);
    match = pattern.exec(text);
  }
  return results;
};

/**
 * Parse fish errors from Fish output for a given document.
 *
 * @param document The document to whose contents errors refer
 * @param output The error output from Fish.
 * @return An array of all diagnostics
 */
const parseFishErrors = (
  document: TextDocument,
  output: string,
): ReadonlyArray<Diagnostic> =>
  getMatches(/^(.+) \(line (\d+)\): (.+)$/gm, output)
    .map(match => ({
      fileName: match[1],
      lineNumber: Number.parseInt(match[2]),
      message: match[3],
    }))
    .filter(
      ({ fileName }) => expandUser(fileName).toString === document.uri.toString,
    )
    .map(({ message, lineNumber }) => {
      const range = document.validateRange(
        new Range(lineNumber - 1, 0, lineNumber - 1, Number.MAX_VALUE),
      );
      const diagnostic = new Diagnostic(range, message);
      diagnostic.source = "fish";
      return diagnostic;
    });

/**
 * Lint a document with fish -n.
 *
 * @param document The document to check
 * @return The resulting diagnostics
 */
const getDiagnostics = (
  document: TextDocument,
): Promise<ReadonlyArray<Diagnostic>> =>
  runInWorkspace(vscode.workspace.getWorkspaceFolder(document.uri), [
    "fish",
    "-n",
    document.fileName,
  ]).then(result => parseFishErrors(document, result.stderr));

/**
 * Start linting Fish documents.
 *
 * @param context The extension context
 */
const startLinting = (context: ExtensionContext): void => {
  const diagnostics = vscode.languages.createDiagnosticCollection("fish");
  context.subscriptions.push(diagnostics);

  const lint = (document: TextDocument) => {
    if (isSavedFishDocument(document)) {
      return (
        getDiagnostics(document)
          .catch(error => {
            vscode.window.showErrorMessage(error.toString());
            diagnostics.delete(document.uri);
          })
          // tslint:disable-next-line:readonly-array
          .then(d => diagnostics.set(document.uri, d as Diagnostic[]))
      );
    } else {
      Promise.resolve();
    }
  };

  vscode.workspace.onDidOpenTextDocument(lint, null, context.subscriptions);
  vscode.workspace.onDidSaveTextDocument(lint, null, context.subscriptions);
  vscode.workspace.textDocuments.forEach(lint);

  // Remove diagnostics for closed files
  vscode.workspace.onDidCloseTextDocument(
    d => diagnostics.delete(d.uri),
    null,
    context.subscriptions,
  );
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
  range?: Range,
): Promise<ReadonlyArray<TextEdit>> => {
  const actualRange = document.validateRange(
    range || new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE),
  );
  const result = await runInWorkspace(
    vscode.workspace.getWorkspaceFolder(document.uri),
    ["fish_indent"],
    document.getText(actualRange),
  ).catch(error => {
    vscode.window.showErrorMessage(`Failed to run fish_indent: ${error}`);
    // Re-throw the error to make the promise fail
    throw error;
  });
  return result.exitCode === 0
    ? [TextEdit.replace(actualRange, result.stdout)]
    : [];
};

/**
 * A type for all formatting providers.
 */
type FormattingProviders = DocumentFormattingEditProvider &
  DocumentRangeFormattingEditProvider;

/**
 * Formatting providers for fish documents.
 */
const formattingProviders: FormattingProviders = {
  provideDocumentFormattingEdits: (document, _, token) =>
    getFormatRangeEdits(document).then(edits =>
      token.isCancellationRequested
        ? []
        : // tslint:disable-next-line:readonly-array
          (edits as TextEdit[]),
    ),
  provideDocumentRangeFormattingEdits: (document, range, _, token) =>
    getFormatRangeEdits(document, range).then(edits =>
      token.isCancellationRequested
        ? []
        : // tslint:disable-next-line:readonly-array
          (edits as TextEdit[]),
    ),
};

/**
 * Get the version of fish.
 *
 * @return A promise with the fish version string.  If fish doesn't exist or if
 * the version wasn't found the promise is rejected.
 */
const getFishVersion = (): Promise<string> =>
  runInWorkspace(undefined, ["fish", "--version"]).then(result => {
    const matches = result.stdout.match(/^fish, version (.+)$/m);
    if (matches && matches.length === 2) {
      return matches[1];
    } else {
      throw new Error(`Failed to extract fish version from: ${result.stdout}`);
    }
  });

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
  const version = await getFishVersion();
  console.log("Found fish version", version);

  startLinting(context);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "fish",
      formattingProviders,
    ),
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      "fish",
      formattingProviders,
    ),
  );
};
