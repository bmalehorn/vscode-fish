# SYNTAX TEST "source.fish" "Control flow keywords"

# function keyword
function my_func
#^^^^^^^ keyword.control.fish
end

# while keyword
while true
#^^^^ keyword.control.fish
end

# if/else keywords
if test -d foo
#^ keyword.control.fish
    echo yes
else
#^^^ keyword.control.fish
    echo no
end

# switch/case keywords
switch $var
#^^^^^ keyword.control.fish
    case a
#   ^^^^ keyword.control.fish
        echo a
end

# for/in keywords
for item in $list
#^^ keyword.control.fish
#        ^^ keyword.control.fish
echo $item
end

# begin/end keywords
begin
#^^^^ keyword.control.fish
    set -l local_var
end
#^^ keyword.control.fish

while false
# continue keyword
continue
#^^^^^^^ keyword.control.fish
end


while false
# break keyword
break
#^^^^ keyword.control.fish
end

# return keyword
return
#^^^^^ keyword.control.fish

# source keyword
source ~/config.fish
#^^^^^ keyword.control.fish

# exit keyword
exit
#^^^ keyword.control.fish

# wait keyword
wait
#^^^ keyword.control.fish

# and keyword
test -f foo; and echo found
#            ^^^ keyword.control.fish

# or keyword
test -f foo; or echo missing
#            ^^ keyword.control.fish

# not keyword
not test -d bar
#^^ keyword.control.fish

# Keywords should NOT match with dots before them
.function
# ^^^^^^^ - keyword.control.fish

# Keywords should NOT match with ? or ! after them
function?
#^^^^^^^^ - keyword.control.fish

if!
#^^ - keyword.control.fish

while not true
#     ^^^ keyword.control.fish
end
