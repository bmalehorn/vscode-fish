# SYNTAX TEST "source.fish" "keyword subcommands"

# The word following `if`, `and`, `or`, `not` keywords is a command.
# It should be highlighted entirely like a command.

echo hello
# ^^ support.function.command.fish

if echo hello; end
#  ^^^^ support.function.command.fish

if not echo hello; end
#      ^^^^ support.function.command.fish

echo hello; and echo world
#               ^^^^ support.function.command.fish
echo hello; or echo world
#              ^^^^ support.function.command.fish

#  The same applies to ! - exact same as `not`
if ! echo hello; end
#    ^^^^ support.function.command.fish

# The same applies  to `||` and `&&`, which do not expect a semicolon or start
# of line.
echo hello || echo world
#             ^^^^ support.function.command.fish
echo hello && echo world
#             ^^^^ support.function.command.fish

# Applies in a subshell as well.
echo (if echo 123; end)
#        ^^^^ support.function.command.fish
echo $(if echo 123; end)
#         ^^^^ support.function.command.fish
