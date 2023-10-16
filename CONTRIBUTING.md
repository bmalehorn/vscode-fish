# Contributing to VSCode Fish

## Syntax Highlighting

Visual Studio Code uses [TextMate grammars](https://macromates.com/manual/en/language_grammars) for syntax highlighting.
Due to the limitations of JSON, most projects generate the grammar definition using another file format, like YAML.

We use the [yaml](https://github.com/eemeli/yaml/) package to convert the YAML grammar definition to JSON, without any custom processing.

### Example Pattern

TextMate pattern in JSON:

```json
{
  "comment": "https://fishshell.com/docs/current/#quotes",
  "match": "\\\\(\\\"|\\$|$|\\\\)",
  "name": "constant.character.escape.fish"
}
```

The same pattern in YAML:

```yaml
comment: https://fishshell.com/docs/current/#quotes
match: \\(\"|\$|$|\\)
name: constant.character.escape.fish
```

### Contributing Grammar Changes

1. Make your changes to any YAML file in the `syntaxes/` directory.
2. Run `yarn build:grammar`
3. Commit both the YAML file and the generated JSON file to the repository.

### More Information

- [VS Code Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- [TextMate Language Grammars Documentation](https://macromates.com/manual/en/language_grammars)
