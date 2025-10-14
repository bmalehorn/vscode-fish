# SYNTAX TEST "source.fish" "list variables"

echo $list_variable[1]
#    ^ variable.other.normal.fish punctuation.definition.variable.fish
#     ^^^^^^^^^^^^^ variable.other.normal.fish
#                   ^ meta.embedded.slice.fish

# In a meta.embedded.slice.fish, `..` is treated as a keyword
echo $list_variable[1..-2]
#    ^ variable.other.normal.fish punctuation.definition.variable.fish
#     ^^^^^^^^^^^^^ variable.other.normal.fish
#                   ^^^^^ meta.embedded.slice.fish
#                    ^^ keyword.control.fish

# not a keyword outside of a list variable context
echo 1..-2
#     ^^ - keyword.control.fish

# This applies in a substring too, similar to subshell
echo "$list_variable[1] 2"
#      ^^^^^^^^^^^^^ string.quoted.double.fish variable.other.normal.fish
#                   ^^^ meta.embedded.slice.fish
#                   ^^^^^ string.quoted.double.fish

# subshells are supposed inside slices
echo $list_variable[(math 1 + 2)..3]
#     ^^^^^^^^^^^^^ variable.other.normal.fish
#                   ^^^^^^^^^^^^ meta.embedded.subshell.fish
#                    ^^^^ support.function.command.fish

# nesting strings, slice, subshell, all works
echo "$list_variable[(math 1 + 2)..3]"
#    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ string.quoted.double.fish
#                   ^^^^^^^^^^^^^^^^^ meta.embedded.slice.fish
#                    ^^^^^^^^^^^^ meta.embedded.subshell.fish

# The start of a slice is not the same as the start of a line or subshell.
# It should not cause the first work to be highlighted as a command.
echo $list_variable[echo hello]
#                   ^^^^ - support.function.command.fish
