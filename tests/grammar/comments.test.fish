# SYNTAX TEST "source.fish" "Comments"

# This is a comment
#^^^^^^^^^^^^^^^^^^ comment.line.number-sign.fish

# Another comment
#^^^^^^^^^^^^^^^^ comment.line.number-sign.fish

echo test # inline comment
#         ^^^^^^^^^^^^^^^^^ comment.line.number-sign.fish
#         ^ punctuation.definition.comment.fish

# Comments should NOT match inside strings
echo "# not a comment"
#     ^ - punctuation.definition.comment
#     ^^^^^^^^^^^^^^^^ - comment.line
