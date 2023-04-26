# Convention for snippets

Naming convention for `description`:

- for operators it's `<operator> operator` (e.g. `if operator`)
- for functions it's `function definition` or `"<function>" function definition`
- for builtins it's `"<builtin>" invocation` (e.g. `"set" invocation"`)
- for shell shebang it's `shebang`
- for anything else it's any string

Naming convention for `prefix`:

- for operators it's `<operator>` (e.g. `if`), `<operator>-compare` (e.g. `if-compare`), or `<operator>-compare-<operator>` (e.g. `if-compare-else`)
- for functions it's `function`, `<function>` (e.g. `main`), or `function-<long-option>` (e.g. `function-arguments`)
- for builtins it's `<builtin>` (e.g. `set`) or `<builtin>-<long-option>`
- for shebang it's `shebang`
- for anything else it's any string
