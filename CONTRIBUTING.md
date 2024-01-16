# Contributing

To make some command listed in intellisence suggestions use either `Keyword` or
`Builtin` TypeScript function in [`extension.ts`](./src/extension.ts).

To explain options available for a command (currently it's possible just for
builtins) add an array of objects like this:

```typescript
          Builtin("alias", "Create a function", [
            {
              description: "Save into your fish configuration directory",
              long: "save",
            },
          ]),
```

as the third parameter. By default it's assumed that all builtins have
`-h`|`--help` options available, but if they are not pass `false` as the last
argument.
