# SYNTAX TEST "source.fish" "Escape characters"

foo \$bar
#   ^^ constant.character.escape.string.fish
#     ^^^ - variable.other.normal.fish

foo "bar \" ack"
#   ^^^^^^^^^^^^ string.quoted.double.fish
#        ^^ constant.character.escape.fish

# subshell is not fooled by \)
foo (ack \) bar)
#   ^^^^^^^^^^^^ meta.embedded.subshell.fish
#        ^^ constant.character.escape.string.fish

# slice is not fooled by \]
echo $list_variable[1 \] 2]
#                  ^^^^^^^^ meta.embedded.slice.fish
#                     ^^ constant.character.escape.string.fish

# subshell is not fooled by \) in a string
foo "$(ack \) bar)"
#    ^^^^^^^^^^^^^ meta.embedded.subshell.fish
#          ^^ constant.character.escape.string.fish

# double backslash ends subshell (backslash is escaped, not paren)
foo (ack \\) bar
#   ^^^^^^^^ meta.embedded.subshell.fish
#        ^^ constant.character.escape.string.fish
#            ^^^ - meta.embedded.subshell.fish

# double backslash ends slice (backslash is escaped, not bracket)
echo $list_variable[1 \\] 2
#                  ^^^^^ meta.embedded.slice.fish
#                     ^^ constant.character.escape.string.fish
#                         ^ - meta.embedded.slice.fish
