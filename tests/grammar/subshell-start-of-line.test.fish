# SYNTAX TEST "source.fish" "subshells with start of line commands"

echo $(source foo.fish)
#      ^^^^^^ keyword.control.fish

echo "$(source foo.fish)"
#       ^^^^^^ keyword.control.fish
