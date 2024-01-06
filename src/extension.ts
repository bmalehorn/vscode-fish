// Copyright (c) 2019-2022 Brian Malehorn
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

function Keyword(keyword: string, description: string) {
  var item = new vscode.CompletionItem(
    keyword,
    vscode.CompletionItemKind.Keyword,
  );
  var documentation = new vscode.MarkdownString(`## Description\n`);
  documentation.appendMarkdown(`${description}`);

  return item;
}

type Option = {
  description: string;
  short?: string;
  long?: string;
  validValues?: string[];
};

function Builtin(
  keyword: string,
  description: string,
  options?: Option[],
  helpOptionAvailable: boolean = true,
) {
  var item = new vscode.CompletionItem(
    keyword,
    vscode.CompletionItemKind.Function,
  );

  var documentation = new vscode.MarkdownString(`## Description\n`);
  documentation.appendMarkdown(`${description}`);

  if (options) {
    if (helpOptionAvailable)
      options = [
        {
          description: "Print help message for this command",
          short: "h",
          long: "help",
        },
        ...options,
      ];

    documentation.appendMarkdown("\n## Options\n");
    documentation.appendMarkdown(
      options
        .map((item, index) => {
          var short = null;
          if (item.short) short = `**-${item.short}**`;
          var long = null;
          if (item.long) long = `**--${item.long}**`;

          var variants = [short, long]
            .filter((item) => typeof item === "string")
            .join(" | ");

          var description = item.description;

          var validValues = null;
          if (item.validValues) {
            validValues = ` (must be one of: ${item.validValues.join(", ")})`;
            description += `${validValues}`;
          }

          return `- ${variants}: ${description}`;
        })
        .join("\n"),
    );
  }

  documentation.appendText("\n");
  documentation.appendMarkdown(
    `\n[Read web documentation](https://fishshell.com/docs/current/cmds/${keyword.replace(
      " ",
      "-",
    )}.html)`,
  );

  item.documentation = documentation;
  return item;
}

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

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider("fish", {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
      ) {
        return [
          Builtin("_", "Call fish’s translations"),
          Builtin("abbr", "Manage fish abbreviations", [
            {
              description: "Add abbreviation",
              long: "add",
            },
            {
              description: "Expansion position",
              long: "position",
              validValues: ["command", "anywhere"],
            },
            {
              description: "Match using the regular expression",
              short: "r",
              long: "regex",
            },
            {
              description:
                "Move cursor to the first occurrence of it's argument",
              long: "set-cursor",
            },
            {
              description:
                "Name of a fish function instead of a literal replacement",
              short: "f",
              long: "function",
            },
            {
              description: "Erase abbreviation",
              long: "erase",
            },
            {
              description: "Rename abbreviation",
              long: "rename",
            },
            {
              description:
                "Print all abbreviations in a manner suitable for import and export",
              long: "show",
            },
            {
              description: "Print abbreviation names",
              long: "list",
            },
            {
              description: "Check whether abbreviation exists",
              long: "query",
            },
          ]),
          Builtin("alias", "Create a function", [
            {
              description: "Save into your fish configuration directory",
              long: "save",
            },
          ]),
          Keyword("and", "Conditionally execute a command"),
          Builtin(
            "argparse",
            "Parse options passed to a fish script or function",
            [
              {
                description: "Command name for use in error messages",
                short: "n",
                long: "name",
              },
              {
                description: "Comma-separated mutually exclusive options",
                short: "x",
                long: "exclusive",
              },
              {
                description: "Minimum amount of positional arguments",
                short: "N",
                long: "min-args",
              },
              {
                description: "Maximum amount of positional arguments",
                short: "X",
                long: "max-args",
              },
              {
                description: "Whether to ignore unknown options",
                short: "i",
                long: "ignore-unknown",
              },
              {
                description:
                  "Whether to stop argument processing on the first positional argument",
                short: "s",
                long: "stop-nonopt",
              },
            ],
          ),
          Keyword("begin", "Start a new block of code"),
          Builtin("bg", "Send jobs to background", []), // Empty array is used to signify that there are some options available for this command
          Builtin("bind", "Handle fish key bindings", [
            {
              description: "Mode binding is available in",
              short: "M",
              long: "mode",
              validValues: ["default", "vi"],
            },
            {
              description: "Set mode after binding is executed",
              short: "m",
              long: "sets-mode",
              validValues: ["default", "vi"],
            },
            {
              description: "Whether to operate on preset bindings",
              long: "present",
            },
            {
              description: "Whether to operate on user bindings",
              long: "user",
            },
            {
              description: "Whether to silence some errors",
              short: "s",
              long: "silent",
            },
            {
              description: "Key name",
              short: "k",
              long: "key",
            },
            {
              description: "Print key names",
              short: "K",
              long: "key-names",
            },
            {
              description:
                "Whether to print all key names even those that don't have a known mapping",
              short: "a",
              long: "all",
            },
            {
              description: "Print function names",
              short: "f",
              long: "function-names",
            },
            {
              description: "Print bind modes",
              short: "L",
              long: "list-modes",
            },
            {
              description: "Erase binding",
              short: "e",
              long: "erase",
            },
          ]),
          Builtin("block", "temporarily block delivery of events"),
          Keyword("break", "stop the current inner loop"),
          Builtin("breakpoint", "launch debug mode"),
          Keyword("builtin", "run a builtin command"),
          Keyword("case", "conditionally execute a block of commands"),
          Builtin("cd", "change directory"),
          Builtin("cdh", "change to a recently visited directory"),
          Keyword("command", "run a program"),
          Builtin("commandline", "set or get the current command line buffer"),
          Builtin("complete", "edit command-specific tab-completions"),
          Builtin("contains", "test if a word is present in a list"),
          Keyword(
            "continue",
            "skip the remainder of the current iteration of the current inner loop",
          ),
          Builtin("count", "count the number of elements of a list"),
          Builtin("dirh", "print directory history"),
          Builtin("dirs", "print directory stack"),
          Builtin("disown", "remove a process from the list of jobs"),
          Builtin("echo", "display a line of text"),
          Builtin("else", "execute command if a condition is not met"),
          Builtin("emit", "emit a generic event"),
          Keyword("end", "end a block of commands"),
          Builtin("eval", "evaluate the specified commands"),
          Keyword("exec", "execute command in current process"),
          Builtin("exit", "exit the shell"),
          Builtin("false", "return an unsuccessful result"),
          Builtin("fg", "bring job to foreground"),
          Builtin("fish", "the friendly interactive shell"),
          Builtin("fish_add_path", "add to the path"),
          Builtin(
            "fish_breakpoint_prompt",
            "define the prompt when stopped at a breakpoint",
          ),
          Builtin("fish_clipboard_copy", "copy text to the system’s clipboard"),
          Builtin(
            "fish_clipboard_paste",
            "get text from the system’s clipboard",
          ),
          Builtin(
            "fish_command_not_found",
            "what to do when a command wasn’t found",
          ),
          Builtin("fish_config", "start the web-based configuration interface"),
          Builtin(
            "fish_default_key_bindings",
            "set emacs key bindings for fish",
          ),
          Builtin(
            "fish_delta",
            "compare functions and completions to the default",
          ),
          Builtin(
            "fish_git_prompt",
            "output git information for use in a prompt",
          ),
          Builtin(
            "fish_greeting",
            "display a welcome message in interactive shells",
          ),
          Builtin(
            "fish_hg_prompt",
            "output Mercurial information for use in a prompt",
          ),
          Builtin("fish_indent", "indenter and prettifier"),
          Builtin("fish_is_root_user", "check if the current user is root"),
          Builtin(
            "fish_key_reader",
            "explore what characters keyboard keys send",
          ),
          Builtin(
            "fish_mode_prompt",
            "define the appearance of the mode indicator",
          ),
          Builtin(
            "fish_opt",
            "create an option specification for the argparse command",
          ),
          Builtin(
            "fish_prompt",
            "define the appearance of the command line prompt",
          ),
          Builtin(
            "fish_right_prompt",
            "define the appearance of the right-side command line prompt",
          ),
          Builtin(
            "fish_status_to_signal",
            "convert exit codes to human-friendly signals",
          ),
          Builtin(
            "fish_svn_prompt",
            "output Subversion information for use in a prompt",
          ),
          Builtin("fish_title", "define the terminal’s title"),
          Builtin(
            "fish_update_completions",
            "update completions using manual pages",
          ),
          Builtin(
            "fish_vcs_prompt",
            "output version control system information for use in a prompt",
          ),
          Builtin("fish_vi_key_bindings", "set vi key bindings for fish"),
          Keyword("for", "perform a set of commands multiple times"),
          Builtin("funced", "edit a function interactively"),
          Builtin(
            "funcsave",
            "save the definition of a function to the user’s autoload directory",
          ),
          Keyword("function", "create a function"),
          Builtin("functions", "print or erase functions"),
          Builtin("help", "display fish documentation"),
          Builtin("history", "show and manipulate command history"),
          Keyword("if", "conditionally execute a command"),
          Builtin("isatty", "test if a file descriptor is a terminal"),
          Builtin("jobs", "print currently running jobs"),
          Builtin("math", "perform mathematics calculations"),
          Builtin("nextd", "move forward through directory history"),
          Keyword("not", "negate the exit status of a job"),
          Builtin("open", "open file in its default application"),
          Keyword("or", "conditionally execute a command"),
          Builtin("path", "manipulate and check paths"),
          Builtin("popd", "move through directory stack"),
          Builtin("prevd", "move backward through directory history"),
          Builtin("printf", "display text according to a format string"),
          Builtin(
            "prompt_hostname",
            "print the hostname, shortened for use in the prompt",
          ),
          Builtin("prompt_login", "describe the login suitable for prompt"),
          Builtin("prompt_pwd", "print pwd suitable for prompt"),
          Builtin("psub", "perform process substitution"),
          Builtin("pushd", "push directory to directory stack"),
          Builtin("pwd", "output the current working directory"),
          Builtin("random", "generate random number"),
          Builtin("read", "read line of input into variables"),
          Builtin(
            "realpath",
            "convert a path to an absolute path without symlinks",
          ),
          Keyword("return", "stop the current inner function"),
          Builtin("set", "display and change shell variables"),
          Builtin("set_color", "set the terminal color"),
          Builtin("source", "evaluate contents of file"),
          Builtin("status", "query fish runtime information"),
          Builtin("string", "manipulate strings"),
          Builtin("string collect", "join strings into one"),
          Builtin("string escape", "escape special characters"),
          Builtin("string join", "join strings with delimiter"),
          Builtin("string join0", "join strings with zero bytes"),
          Builtin("string length", "print string lengths"),
          Builtin("string lower", "convert strings to lowercase"),
          Builtin("string match", "match substrings"),
          Builtin("string pad", "pad strings to a fixed width"),
          Builtin("string repeat", "multiply a string"),
          Builtin("string replace", "replace substrings"),
          Builtin(
            "string shorten",
            "shorten strings to a width, with an ellipsis",
          ),
          Builtin("string split", "split strings by delimiter"),
          Builtin("string split0", "split on zero bytes"),
          Builtin("string sub", "extract substrings"),
          Builtin("string trim", "remove trailing whitespace"),
          Builtin("string unescape", "expand escape sequences"),
          Builtin("string upper", "convert strings to uppercase"),
          Builtin("suspend", "suspend the current shell"),
          Keyword("switch", "conditionally execute a block of commands"),
          Builtin("test", "perform tests on files and text"),
          Keyword("time", "measure how long a command or block takes"),
          Builtin("trap", "perform an action when the shell receives a signal"),
          Builtin("true", "return a successful result"),
          Builtin("type", "locate a command and describe its type"),
          Builtin("ulimit", "set or get resource usage limits"),
          Builtin("umask", "set or get the file creation mode mask"),
          Builtin(
            "vared",
            "interactively edit the value of an environment variable",
          ),
          Builtin("wait", "wait for jobs to complete"),
          Keyword("while", "perform a set of commands multiple times"),
        ];
      },
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
        vscode.window.showErrorMessage((error as any)?.toString());
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
