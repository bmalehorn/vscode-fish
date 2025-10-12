# SYNTAX TEST "source.fish" "IO Redirection operators"

# Standard input redirection
cat < input.txt
#   ^ keyword.operator.redirect.fish

# Standard output redirection
echo hello > output.txt
#          ^ keyword.operator.redirect.fish

# Output append
echo hello >> output.txt
#          ^^ keyword.operator.redirect.fish

# Stderr redirection (^)
command ^ error.log
#       ^ keyword.operator.redirect.fish

# Stderr append (^^)
command ^^ error.log
#       ^^ keyword.operator.redirect.fish

# Stderr redirection with file descriptor merge (&2)
echo foo >&2
#        ^^^ keyword.operator.redirect.fish

# Explicit file descriptor redirection
command 2> error.log
#       ^^ keyword.operator.redirect.fish

command 2>> error.log
#       ^^^ keyword.operator.redirect.fish

# File descriptor redirection with merge
command 2>&1
#       ^^^^ keyword.operator.redirect.fish

# Stdin from file descriptor
command 0< input.txt
#       ^^ keyword.operator.redirect.fish
