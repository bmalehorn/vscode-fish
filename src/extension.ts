// Copyright (c) 2019-2020 Brian Malehorn
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
      formattingProviders,
    ),
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      "fish",
      formattingProviders,
    ),
  );

  const tokenTypes = [
    "property",
    "type",
    "class",
    "interface",
    "enum",
    "function",
    "variable",
  ];
  const tokenModifiers = ["private", "static", "declaration", "documentation"];
  const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

  const provider: vscode.DocumentSemanticTokensProvider = {
    provideDocumentSemanticTokens(
      _document: vscode.TextDocument,
    ): vscode.ProviderResult<vscode.SemanticTokens> {
      // analyze the document and return semantic tokens
      const token1s = [
        {
          line: 2,
          startChar: 5,
          length: 3,
          tokenType: "property",
          tokenModifiers: ["private", "static"],
        },
        {
          line: 2,
          startChar: 10,
          length: 4,
          tokenType: "type",
          tokenModifiers: [],
        },
        {
          line: 5,
          startChar: 2,
          length: 7,
          tokenType: "class",
          tokenModifiers: [],
        },
      ];
      console.log("token1s", token1s);
      const token2s = convert1To2(token1s, tokenTypes, tokenModifiers);
      console.log("token2s", token2s);
      const token3s = convert2To3(token2s);
      console.log("token3s", token3s);
      const token4s = convert3To4(token3s);
      console.log("token4s", token4s);

      return convertWithBuilder(token1s, tokenTypes, tokenModifiers);
    },
  };

  const selector = { language: "fish", scheme: "file" }; // register for all fish documents from the local file system

  vscode.languages.registerDocumentSemanticTokensProvider(
    selector,
    provider,
    legend,
  );
};

type Token1 = {
  line: number;
  startChar: number;
  length: number;
  tokenType: string;
  tokenModifiers: Array<string>;
};

type Token2 = {
  deltaLine: number;
  deltaStartChar: number;
  length: number;
  tokenType: number;
  tokenModifiers: number;
};

type Token3 = [number, number, number, number, number];

type Token4s = Uint32Array;

function convertWithBuilder(
  token1s: Array<Token1>,
  tokenTypes: Array<string>,
  tokenModifiers: Array<string>,
) {
  const tokensBuilder = new vscode.SemanticTokensBuilder(
    new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers),
  );

  token1s.forEach((token1) => {
    tokensBuilder.push(
      new Range(
        new vscode.Position(token1.line, token1.startChar),
        new vscode.Position(token1.line, token1.startChar + token1.length),
      ),
      token1.tokenType,
      token1.tokenModifiers,
    );
  });
  return tokensBuilder.build();
}

export function convert1To2(
  token1s: Array<Token1>,
  tokenTypes: Array<string>,
  tokenModifiers: Array<string>,
): Array<Token2> {
  if (tokenModifiers.length >= 32) {
    throw new Error(
      `tokenModifiers length of ${
        tokenModifiers.length
      } exeeds 32-bit limit. TokenModifiers = ${JSON.stringify(
        tokenModifiers,
      )}`,
    );
  }

  let lastLine = 0;
  let lastStartChar = 0;

  return token1s.map((token1) => {
    const deltaLine = token1.line - lastLine;
    let deltaStartChar: number;
    if (token1.line === lastLine) {
      deltaStartChar = token1.startChar - lastStartChar;
    } else {
      deltaStartChar = token1.startChar;
    }
    lastLine = token1.line;
    lastStartChar = token1.startChar;

    const tokenTypesIndex = tokenTypes.indexOf(token1.tokenType);
    if (tokenTypesIndex === -1) {
      throw new Error(
        `tokenType ${token1.tokenType} not found in ${JSON.stringify(
          tokenTypes,
        )}`,
      );
    }
    let tokenModifiersMask = 0;
    token1.tokenModifiers.forEach((tokenModifier) => {
      if (tokenModifiers.indexOf(tokenModifier) === -1) {
        throw new Error(
          `tokenModifier ${tokenModifier} not found in ${JSON.stringify(
            tokenModifiers,
          )}`,
        );
      }
      tokenModifiersMask |= 1 << tokenModifiers.indexOf(tokenModifier);
    });
    return {
      deltaLine,
      deltaStartChar,
      length: token1.length,
      tokenType: tokenTypesIndex,
      tokenModifiers: tokenModifiersMask,
    };
  });
}

export function convert2To3(token2s: Array<Token2>): Array<Token3> {
  return token2s.map(
    ({ deltaLine, deltaStartChar, length, tokenType, tokenModifiers }) => [
      deltaLine,
      deltaStartChar,
      length,
      tokenType,
      tokenModifiers,
    ],
  );
}

export function convert3To4(token3s: Array<Token3>): Token4s {
  const array = Array.prototype.concat.apply([], token3s);
  return new Uint32Array(array);
}

function testConversionFunctions() {}

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
        const result = await runInWorkspace(workspaceFolder, [
          "fish",
          "-n",
          document.fileName,
        ]);
        var d = fishOutputToDiagnostics(document, result.stderr);
      } catch (error) {
        vscode.window.showErrorMessage(error.toString());
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
  range?: Range,
): Promise<ReadonlyArray<TextEdit>> => {
  const actualRange = document.validateRange(
    range || new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE),
  );
  try {
    var result = await runInWorkspace(
      vscode.workspace.getWorkspaceFolder(document.uri),
      ["fish_indent"],
      document.getText(actualRange),
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to run fish_indent: ${error}`);
    // Re-throw the error to make the promise fail
    throw error;
  }
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
    getFormatRangeEdits(document).then((edits) =>
      token.isCancellationRequested
        ? []
        : // tslint:disable-next-line:readonly-array
          (edits as TextEdit[]),
    ),
  provideDocumentRangeFormattingEdits: (document, range, _, token) =>
    getFormatRangeEdits(document, range).then((edits) =>
      token.isCancellationRequested
        ? []
        : // tslint:disable-next-line:readonly-array
          (edits as TextEdit[]),
    ),
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
  const results = [];
  // We need to loop through the regexp here, so a let is required
  let match = pattern.exec(text);
  while (match !== null) {
    results.push(match);
    match = pattern.exec(text);
  }
  return results;
};
