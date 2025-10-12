# SYNTAX TEST "source.fish" "Storage type (function)"

# Also appears as keyword.control
function another_func
#^^^^^^^ keyword.control.fish
end

# Should NOT match with dot before
.function
# ^^^^^^^ - storage.type.fish

# Should NOT match with ? or ! after
function?
#^^^^^^^^ - storage.type.fish
