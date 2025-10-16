# SYNTAX TEST "source.fish" "Escape sequences (outside of strings)"

# Single character escapes: \a \b \e \f \n \r \t \v (space) $ * ? ~ # ( ) { } [ ] < > ^ & | ; " '
echo \a
#    ^^ constant.character.escape.string.fish

echo \n
#    ^^ constant.character.escape.string.fish

echo \t
#    ^^ constant.character.escape.string.fish

# echo \
# NOTE: this should be constant.character.escape.string.fish too.

echo \$
#    ^^ constant.character.escape.string.fish

echo \*
#    ^^ constant.character.escape.string.fish

echo \?
#    ^^ constant.character.escape.string.fish

echo \#
#    ^^ constant.character.escape.string.fish

echo \(
#    ^^ constant.character.escape.string.fish

echo \)
#    ^^ constant.character.escape.string.fish

echo \{
#    ^^ constant.character.escape.string.fish

echo \}
#    ^^ constant.character.escape.string.fish

echo \[
#    ^^ constant.character.escape.string.fish

echo \]
#    ^^ constant.character.escape.string.fish

echo \"
#    ^^ constant.character.escape.string.fish

echo \'
#    ^^ constant.character.escape.string.fish

# Hexadecimal ASCII escape (1-2 hex digits)
echo \x41
#    ^^^^ constant.character.escape.hex-ascii.fish

echo \xF
#    ^^^ constant.character.escape.hex-ascii.fish

echo \x2A
#    ^^^^ constant.character.escape.hex-ascii.fish

# Hexadecimal byte escape (1-2 hex digits)
echo \X41
#    ^^^^ constant.character.escape.hex-byte.fish

echo \XFF
#    ^^^^ constant.character.escape.hex-byte.fish

# Octal escape (1-3 octal digits)
echo \101
#    ^^^^ constant.character.escape.octal.fish

echo \7
#    ^^ constant.character.escape.octal.fish

# 16-bit Unicode escape (1-4 hex digits)
echo \u0041
#    ^^^^^^ constant.character.escape.unicode-16-bit.fish

echo \u9
#    ^^^ constant.character.escape.unicode-16-bit.fish

echo \uFFFF
#    ^^^^^^ constant.character.escape.unicode-16-bit.fish

# 32-bit Unicode escape (1-8 hex digits)
echo \U00000041
#    ^^^^^^^^^^ constant.character.escape.unicode-32-bit.fish

echo \U1F4A9
#    ^^^^^^^^ constant.character.escape.unicode-32-bit.fish

echo \UFFFFF
#    ^^^^^^^ constant.character.escape.unicode-32-bit.fish

# Control character escape (ctrl + letter)
echo \ca
#    ^^^ constant.character.escape.control.fish

echo \cZ
#    ^^^ constant.character.escape.control.fish

echo \cM
#    ^^^ constant.character.escape.control.fish
