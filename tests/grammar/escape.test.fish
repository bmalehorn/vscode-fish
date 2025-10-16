# SYNTAX TEST "source.fish" "Escape characters"

foo \$bar
#   ^^ constant.character.escape.single.fish
#     ^^^ - variable.other.normal.fish

foo "bar \" ack"
#   ^^^^^^^^^^^^ string.quoted.double.fish
#        ^^ constant.character.escape.fish

# subshell is not fooled by \)
foo (ack \) bar)
#   ^^^^^^^^^^^^ meta.embedded.subshell.fish
#        ^^ constant.character.escape.single.fish


# subshell is not fooled by \) in a string
foo "$(ack \) bar)"
#    ^^^^^^^^^^^^^ meta.embedded.subshell.fish
#          ^^ constant.character.escape.single.fish

# double backslash ends subshell (backslash is escaped, not paren)
foo (ack \\) bar
#   ^^^^^^^^ meta.embedded.subshell.fish
#        ^^ constant.character.escape.single.fish
#            ^^^ - meta.embedded.subshell.fish

