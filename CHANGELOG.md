# Change Log

## 1.0.34 (2023-07-26)

- Added snippets ([#37](https://github.com/bmalehorn/vscode-fish/pull/37))

## 1.0.33 (2023-07-18)

- Added GitHub actions

## 1.0.32 (2023-02-17)

- Update badge URLs

## 1.0.31 (2022-08-29)

- Fix publishing reduced image size

## 1.0.30 (2022-08-29)

- Reduced extension size ([#30](https://github.com/bmalehorn/vscode-fish/pull/30))

## 1.0.29 (2022-04-18)

- Updated screenshots & gifs
- Added snippet gif
- Reordered `set` snippet to have more common `-l` setting first

## 1.0.28 (2022-04-18)

- Add snippets: `for`, `while`, `if`, `if`/`else`, `while`, `function`, `begin`/`end`, `and`, `or`, comments ([#28](https://github.com/bmalehorn/vscode-fish/pull/28))

## 1.0.27 (2022-01-22)

- Added keyword highlighting for `and`, `or`, `not`

## 1.0.26 (2022-01-22)

- Re-enable formatting on paste

## 1.0.25 (2022-01-22)

- Fix a bug causing strange formatting when pasting with `"editor.formatOnPaste": true`

## 1.0.24 (2021-08-20)

- Allow syntax highlighting in restricted mode

## 1.0.23 (2021-06-26)

- Added auto indentation after `function`, `if`, `while` and similar keywords ([#22](https://github.com/bmalehorn/vscode-fish/issues/22))
- Added configuration variables, `fish.path.fish` and `fish.path.fish_indent` for overriding the path to `fish` and `fish_indent` executables ([#22](https://github.com/bmalehorn/vscode-fish/issues/22))

## 1.0.22 (2021-05-19)

- Added function syntax highlighting for `;`

## 1.0.21 (2021-04-24)

- Updated to new fish logo
- Updated variables for fish 3.2

## 1.0.20 (2020-07-13)

- Added function syntax highlighting for `(`, `|`, `&&`

## 1.0.19 (2020-07-13)

- Changed function syntax highlighting from whitelist (`cat`, `test`, etc.) to beginning of line & `if` / `for`

## 1.0.18 (2020-07-10)

- Removed incorrect syntax highlighting for `--option`
- Added keyword highlighting for `continue`, `break`, `return`, `source`, `exit`, `wait`

## 1.0.17 (2020-06-12)

- Removed `console.log` at startup
- Refactored

## 1.0.16 (2020-04-20)

- Added highlighting for files with a fish shebang, e.g. `#!/usr/bin/fish` ([#4](https://github.com/bmalehorn/vscode-fish/pull/4))

## 1.0.15 (2020-04-20)

- Added linting screenshot ([#9](https://github.com/bmalehorn/vscode-fish/pull/9))

## 1.0.14 (2020-04-13)

- Fixed syntax highlighting of `\\` within single quotes (fixes [#5](https://github.com/bmalehorn/vscode-fish/pull/5))

## 1.0.13 (2020-04-13)

- Added support for embedding fish within markdown blocks via ` ```fish ` ([#1](https://github.com/bmalehorn/vscode-fish/pull/1))

## 1.0.12 (2020-03-06)

- Updated builtins for fish 3.1
- Removed builtin functions that start with \_\_
- Added instructions on updating builtins

## 1.0.11 (2020-03-06)

- Changed extension icon

## 1.0.10 (2019-12-10)

- Added `history` to builtins
- Added badges to README

## 1.0.9 (2019-08-31)

- Made builtin variables like `$argv` highlight differently

## 1.0.8 (2019-08-31)

- Fixed most escape sequences, e.g. `\*`, `\(`, `\x9`

## 1.0.7 (2019-08-31)

- Fixed a bug breaking syntax highlighting

## 1.0.6 (2019-08-31)

- Fixed backslash escapes in string, e.g. `"\\"` is escaping but `"\n"` isn't

## 1.0.5 (2019-08-30)

- Converted language file to JSON

## 1.0.4 (2019-08-30)

- Disabled variable highlighting in single quotes, e.g. `'$VAR'`

## 1.0.3

- Added screenshots

## 1.0.2

- Fixed highlighting of "\$HOMEDIR"

## 1.0.1

- Added "begin" to keywords

## 1.0.0

- Initial release
