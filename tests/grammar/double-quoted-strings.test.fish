# SYNTAX TEST "source.fish" "Double quoted strings"

# Basic double quoted string
echo "hello world"
#    ^^^^^^^^^^^^^ string.quoted.double.fish
#    ^ punctuation.definition.string.begin.fish
#                ^ punctuation.definition.string.end.fish

# Empty double quoted string
echo ""
#    ^^ string.quoted.double.fish
#    ^ punctuation.definition.string.begin.fish
#     ^ punctuation.definition.string.end.fish

# Double quoted string with variable expansion
echo "hello $USER"
#    ^^^^^^^^^^^^^ string.quoted.double.fish
#           ^ punctuation.definition.variable.fish
#           ^^^^^ variable.other.normal.fish

# Escape sequences in double quotes - only \", \$, newline, and \\ are valid
echo "\""
#     ^^ constant.character.escape.fish

echo "\$"
#     ^^ constant.character.escape.fish

echo "\\"
#     ^^ constant.character.escape.fish

# Multiple escapes
echo "\"\$\\"
#     ^^ constant.character.escape.fish
#       ^^ constant.character.escape.fish
#         ^^ constant.character.escape.fish
