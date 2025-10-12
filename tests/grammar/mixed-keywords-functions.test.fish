# SYNTAX TEST "source.fish" "Mixed keywords and functions"

echo not foo
# ^^ support.function.command.fish
#    ^^^ - keyword.control.fish

not echo foo
# ^ keyword.control.fish
#   ^^^^ - support.function.command.fish
