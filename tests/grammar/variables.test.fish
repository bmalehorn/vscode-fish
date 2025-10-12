# SYNTAX TEST "source.fish" "Variables"

# Built-in variables (variable.language.fish)
echo $argv
#    ^ punctuation.definition.variable.fish
#    ^^^^^ variable.language.fish

echo $CMD_DURATION
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^^^^^ variable.language.fish

echo $COLUMNS
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^ variable.language.fish

echo $LINES
#    ^ punctuation.definition.variable.fish
#    ^^^^^^ variable.language.fish

echo $fish_bind_mode
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^^^^^^^ variable.language.fish

echo $fish_pid
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^ variable.language.fish

echo $FISH_VERSION
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^^^^^ variable.language.fish

echo $history
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^ variable.language.fish

echo $hostname
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^ variable.language.fish

echo $IFS
#    ^ punctuation.definition.variable.fish
#    ^^^^ variable.language.fish

echo $pipestatus
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^^^ variable.language.fish

echo $status
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^ variable.language.fish

echo $umask
#    ^ punctuation.definition.variable.fish
#    ^^^^^^ variable.language.fish

echo $version
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^ variable.language.fish

# Custom variables (variable.other.normal.fish)
echo $HOME
#    ^ punctuation.definition.variable.fish
#    ^^^^^ variable.other.normal.fish

echo $USER
#    ^ punctuation.definition.variable.fish
#    ^^^^^ variable.other.normal.fish

echo $PATH
#    ^ punctuation.definition.variable.fish
#    ^^^^^ variable.other.normal.fish

# Variable with underscore
echo $my_custom_var
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^^^^^^ variable.other.normal.fish

# Variable starting with underscore
echo $_private
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^^^ variable.other.normal.fish

# Variable with numbers
echo $var123
#    ^ punctuation.definition.variable.fish
#    ^^^^^^^ variable.other.normal.fish

# Variables in double quotes should still be recognized
echo "path: $PATH"
#           ^ punctuation.definition.variable.fish
#           ^^^^^ variable.other.normal.fish

# Variables in single quotes should NOT be recognized
echo '$PATH'
#     ^ - punctuation.definition.variable
#     ^^^^^ - variable
