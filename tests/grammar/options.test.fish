# SYNTAX TEST "source.fish" "Command options"

# Short option (single dash, single letter)
ls -l
#  ^^ source.option.fish

# Short options combined
ls -la
#  ^^^ source.option.fish

# Long option (double dash)
git commit --amend
#          ^^^^^^^ source.option.fish

# Option with hyphens
fish_indent --check
#           ^^^^^^^ source.option.fish

npm install --save-dev
#           ^^^^^^^^^^ source.option.fish

# Option with underscores
command --my_option
#       ^^^^^^^^^^^ source.option.fish

# Option with numbers
command --option-123
#       ^^^^^^^^^^^^ source.option.fish

# Multiple options
ls -l --all -a
#  ^^ source.option.fish
#     ^^^^^ source.option.fish
#           ^^ source.option.fish
