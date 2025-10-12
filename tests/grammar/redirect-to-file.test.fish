# SYNTAX TEST "source.fish" "IO Redirection to a file"

# Highlight redirection targets.
echo foo >bar
#        ^ keyword.operator.redirect.fish
#         ^^^ keyword.operator.redirect.target.fish

# However, don't highlight more complex expressions like subshells.
echo foo >(echo bar)
#        ^ keyword.operator.redirect.fish
#         ^^^^^^^^^^ - keyword.operator.redirect
