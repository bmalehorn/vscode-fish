# SYNTAX TEST "source.fish" "Background operator"

# Run command in background
sleep 10 &
#        ^ keyword.operator.background.fish

# Multiple background jobs
command1 & command2 &
#        ^ keyword.operator.background.fish
#                   ^ keyword.operator.background.fish
