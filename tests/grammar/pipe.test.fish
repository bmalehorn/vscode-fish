# SYNTAX TEST "source.fish" "Pipe operator"

# Basic pipe
echo foo | grep bar
#        ^ keyword.operator.pipe.fish

# Multiple pipes
ls | grep test | wc -l
#  ^ keyword.operator.pipe.fish
#              ^ keyword.operator.pipe.fish
