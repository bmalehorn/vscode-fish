# SYNTAX TEST "source.fish" "list variables"

echo $list_variable[1]
#    ^ variable.other.normal.fish punctuation.definition.variable.fish
#     ^^^^^^^^^^^^^ variable.other.normal.fish

# This applies in a substring too, similar to subshell
echo "$list_variable[1] 2"
#      ^^^^^^^^^^^^^ string.quoted.double.fish variable.other.normal.fish
#                   ^^^^^ string.quoted.double.fish

# subshells are supported inside slices
echo $list_variable[(math 1 + 2)..3]
#     ^^^^^^^^^^^^^ variable.other.normal.fish
#                   ^^^^^^^^^^^^ meta.embedded.subshell.fish

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
#                      ^^^^^^^^^^^^ meta.embedded.subshell.fish

# The start of a slice is not the same as the start of a line or subshell.
# It should not cause the first word to be highlighted as a command.
echo $list_variable[echo hello]

# Valid
echo "$list_variable[$(echo '1..2')]"
#                    ^^^^^^^^^^^^^^ meta.embedded.subshell.fish

# Not valid at runtime: 'fish: Invalid index value'
echo "$list_variable[(echo '1..2')]"
#                    ^^^^^^^^^^^^^ - meta.embedded.subshell.fish
