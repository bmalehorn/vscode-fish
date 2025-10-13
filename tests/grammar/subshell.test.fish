# SYNTAX TEST "source.fish" "Command substitution (subshells)"

# Basic command substitution
echo $(pwd)
#    ^^ punctuation.definition.subshell.begin.fish
#    ^^^^^^ meta.embedded.subshell.fish
#      ^^^ support.function.command.fish
#         ^ punctuation.definition.subshell.end.fish

# Command substitution in double-quoted string
echo "path: $(pwd)"
#     ^^^^^^ string.quoted.double.fish
#           ^^ punctuation.definition.subshell.begin.fish
#           ^^^^^^ meta.embedded.subshell.fish
#             ^^^ support.function.command.fish
#                ^ punctuation.definition.subshell.end.fish
#                 ^ punctuation.definition.string.end.fish

# Command substitution with arguments
echo $(echo hello world)
#    ^^ punctuation.definition.subshell.begin.fish
#      ^^^^ support.function.command.fish
#                      ^ punctuation.definition.subshell.end.fish

# Command substitution in string with prefix and suffix
echo "prefix $(echo foo) suffix"
#            ^^ punctuation.definition.subshell.begin.fish
#              ^^^^ support.function.command.fish
#                      ^ punctuation.definition.subshell.end.fish

# Command substitution with pipe
echo $(ls | grep fish)
#    ^^ punctuation.definition.subshell.begin.fish
#      ^^ support.function.command.fish
#         ^ keyword.operator.pipe.fish
#           ^^^^ support.function.command.fish
#                    ^ punctuation.definition.subshell.end.fish

# Command substitution with variable
echo $(echo $HOME)
#    ^^ punctuation.definition.subshell.begin.fish
#      ^^^^ support.function.command.fish
#           ^ punctuation.definition.variable.fish
#           ^^^^^ variable.other.normal.fish
#                ^ punctuation.definition.subshell.end.fish

# Command substitution in path context
cat $(pwd)/file.txt
#   ^^ punctuation.definition.subshell.begin.fish
#     ^^^ support.function.command.fish
#        ^ punctuation.definition.subshell.end.fish

# Command substitution with keyword
if test $(pwd) = /home
#       ^^ punctuation.definition.subshell.begin.fish
#         ^^^ support.function.command.fish
#            ^ punctuation.definition.subshell.end.fish
echo "in home"
end


# Test that nested subshells works
echo 1 "$(echo "2 3" $(echo 4))"
#^^^ support.function.command.fish
#       ^^ punctuation.definition.subshell.begin.fish
#         ^^^^ string.quoted.double.fish meta.embedded.subshell.fish support.function.command.fish
#              ^ string.quoted.double.fish meta.embedded.subshell.fish punctuation.definition.string.begin.fish
#                    ^^ string.quoted.double.fish meta.embedded.subshell.fish meta.embedded.subshell.fish punctuation.definition.subshell.begin.fish
#                      ^^^^ string.quoted.double.fish meta.embedded.subshell.fish meta.embedded.subshell.fish support.function.command.fish
