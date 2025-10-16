# SYNTAX TEST "source.fish" "list variables"

echo $list_variable[1]
#    ^ variable.other.normal.fish punctuation.definition.variable.fish
#     ^^^^^^^^^^^^^ variable.other.normal.fish
#                  ^^^ meta.embedded.slice.fish
#                  ^^^ variable.interpolation.fish

# This applies in a substring too, similar to subshell
echo "$list_variable[1] 2"
#      ^^^^^^^^^^^^^ string.quoted.double.fish variable.other.normal.fish
#                   ^^^ meta.embedded.slice.fish
#                   ^^^ variable.interpolation.string.fish
#                   ^^^^^ string.quoted.double.fish

# subshells are supposed inside slices
echo $list_variable[(math 1 + 2)..3]
#     ^^^^^^^^^^^^^ variable.other.normal.fish
#                   ^^^^^^^^^^^^ meta.embedded.subshell.fish
#                    ^^^^ support.function.command.fish

# nesting strings, slice, subshell, all works
# $() makes a subshell in a string, including in a slice.
echo "foo $list_variable[1..$(math 1 + 1)]"
#                           ^^^^^^^^^^^^^ meta.embedded.subshell.fish

# () is only a subshell outside of a string.
# A string > slice, does not expand ().
echo "foo $list_variable[1..(math 1 + 1)]"
#                            ^^^^^^^^^^^^ - meta.embedded.subshell.fish

# however it does take effect outside of strings.
echo $list_variable[1..(math 1 + 1)]
#                       ^^^^^^^^^^^ meta.embedded.subshell.fish

# The start of a slice is not the same as the start of a line or subshell.
# It should not cause the first work to be highlighted as a command.
echo $list_variable[echo hello]
#                   ^^^^ - support.function.command.fish

# No comments in multiline list variables - # is interpreted as a value.
echo $list_variable[1..#]
#                      ^^ - punctuation.definition.comment.fish
