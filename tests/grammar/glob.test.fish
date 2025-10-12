# SYNTAX TEST "source.fish" "Glob operators"

# Single asterisk (matches any string)
ls *.fish
#  ^ keyword.operator.glob.fish

# Double asterisk (recursive glob)
ls **/*.fish
#  ^^ keyword.operator.glob.fish
#     ^ keyword.operator.glob.fish

# Question mark (matches single character)
ls test?.txt
#      ^ keyword.operator.glob.fish

# Multiple globs in one command
echo *.txt ?.log **/*.fish
#    ^ keyword.operator.glob.fish
#          ^ keyword.operator.glob.fish
#                ^^ keyword.operator.glob.fish
#                   ^ keyword.operator.glob.fish
