# SYNTAX TEST "source.fish" "Commands"

# Command at start of line
echo hello
#^^^ support.function.command.fish

ls -la
#^ support.function.command.fish

# Command after pipe
echo foo | grep bar
#          ^^^^ support.function.command.fish

# Command after semicolon
echo foo; echo bar
#         ^^^^ support.function.command.fish

# Command after parenthesis
echo (pwd)
#     ^^^ support.function.command.fish

# Command after &&
true && echo success
#       ^^^^ support.function.command.fish

# Command after 'if' keyword
if test -f foo
#  ^^^^ support.function.command.fish
end

# Command after 'while' keyword
while true
#     ^^^^ support.function.command.fish
end

# Keywords should NOT be matched as commands
function my_func
#^^^^^^^ - support.function.command.fish
end

if true
#^ - support.function.command.fish
end

# Commands with underscores, hyphens, numbers
my_command
#^^^^^^^^^ support.function.command.fish

fish-command
#^^^^^^^^^^^ support.function.command.fish

command123
#^^^^^^^^^ support.function.command.fish

# Commands with dots and brackets (valid in fish)
test.command
#^^^^^^^^^^^ support.function.command.fish

command[1]
#^^^^^^^^^ support.function.command.fish
