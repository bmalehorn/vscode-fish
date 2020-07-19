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

const TOKEN_TYPES = [
  "namespace",
  "type",
  "class",
  "enum",
  "interface",
  "struct",
  "typeParameter",
  "parameter",
  "variable",
  "property",
  "enumMember",
  "event",
  "function",
  "member",
  "macro",
  "label",
  "comment",
  "string",
  "keyword",
  "number",
  "regexp",
  "operator",
];

const TOKEN_MODIFIERS = [
  "declaration",
  "readonly",
  "static",
  "deprecated",
  "abstract",
  "async",
  "modification",
  "documentation",
  "defaultLibrary",
];

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

  const legend = new vscode.SemanticTokensLegend(TOKEN_TYPES, TOKEN_MODIFIERS);

  const provider: vscode.DocumentSemanticTokensProvider = {
    provideDocumentSemanticTokens: async (
      document: vscode.TextDocument,
    ): Promise<vscode.SemanticTokens> => {
      // analyze the document and return semantic tokens

      const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      const body = document.getText();
      const x1 = +new Date();
      const result = await runInWorkspace(
        workspaceFolder,
        ["fish_indent", "--dump-parse-tree"],
        body,
      );
      const x2 = +new Date();
      console.log("fish_indent", x2 - x1);
      const tokens = createTokens(body, result.stderr);
      const x3 = +new Date();
      console.log("createTokens", x3 - x2);

      const res = convertWithBuilder(tokens, legend);
      const x4 = +new Date();
      console.log("convertWithBuilder", x4 - x3);
      return res;
    },
  };

  const selector = { language: "fish", scheme: "file" }; // register for all fish documents from the local file system

  vscode.languages.registerDocumentSemanticTokensProvider(
    selector,
    provider,
    legend,
  );
};

function createTokens(body: string, parseTreeOut: string): Array<Token> {
  const tokens: Array<Token> = [];
  // {off   10, len   10, indent  1, kw unknown_keyword, symbol_statement} [ |echo hello|\cJ]
  const indexToLineNumber: { [key: number]: number } = {};
  const lineNumberToStartIndex: { [key: number]: number } = {};
  lineNumberToStartIndex[0] = 0;
  let lineNumber = 0;
  for (let i = 0; i < body.length; i++) {
    if (lineNumberToStartIndex[lineNumber] === undefined) {
      lineNumberToStartIndex[lineNumber] = i;
    }
    indexToLineNumber[i] = lineNumber;
    if (body[i] === "\n") {
      lineNumber++;
    }
  }

  parseTreeOut.split("\n").forEach((line) => {
    const result = line.match(
      /\{off\s+(\d+), len\s+(\d+), indent\s+(\d+), kw (\w+), (\w+)\}/,
    );
    if (result === null) {
      return;
    }
    let [, off, len, , kw, kind] = result;
    const offset = +off;
    const length = +len;
    const lineNumber = indexToLineNumber[offset];
    const beginningOfLineIndex = lineNumberToStartIndex[lineNumber];
    if (kw !== "unknown_keyword") {
      tokens.push({
        line: lineNumber,
        startChar: offset - beginningOfLineIndex,
        length,
        tokenType: "keyword",
        tokenModifiers: [],
      });
    } else if (kind === "parse_token_type_string") {
      tokens.push({
        line: lineNumber,
        startChar: offset - beginningOfLineIndex,
        length,
        tokenType: "string",
        tokenModifiers: [],
      });
    }
  });
  return tokens;
}

type Token = {
  line: number;
  startChar: number;
  length: number;
  tokenType: string;
  tokenModifiers: Array<string>;
};

function convertWithBuilder(
  tokens: Array<Token>,
  legend: vscode.SemanticTokensLegend,
) {
  const tokensBuilder = new vscode.SemanticTokensBuilder(legend);

  tokens.forEach((token) => {
    tokensBuilder.push(
      new Range(
        new vscode.Position(token.line, token.startChar),
        new vscode.Position(token.line, token.startChar + token.length),
      ),
      token.tokenType,
      token.tokenModifiers,
    );
  });
  return tokensBuilder.build();
}

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
