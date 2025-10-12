# SYNTAX TEST "source.fish" "Single quoted strings"

# Basic single quoted string
echo 'hello world'
#    ^^^^^^^^^^^^^ string.quoted.single.fish
#    ^ punctuation.definition.string.begin.fish
#                ^ punctuation.definition.string.end.fish

# Empty single quoted string
echo ''
#    ^^ string.quoted.single.fish
#    ^ punctuation.definition.string.begin.fish
#     ^ punctuation.definition.string.end.fish

# Variables should NOT be expanded in single quotes
echo '$USER'
#    ^^^^^^^ string.quoted.single.fish
#     ^ - punctuation.definition.variable
#     ^^^^^ - variable

# Escape sequences in single quotes - only \', \`, and \\ are valid
echo '\''
#     ^^ constant.character.escape.fish

echo '\`'
#     ^^ constant.character.escape.fish

echo '\\'
#     ^^ constant.character.escape.fish

# Multiple escapes
echo '\'\`\\'
#     ^^ constant.character.escape.fish
#       ^^ constant.character.escape.fish
#         ^^ constant.character.escape.fish
