# https://github.com/oh-my-fish/theme-bobthefish
set -g theme_newline_cursor yes
set -g theme_title_display_process yes

abbr -a yt yarn test
abbr -a brs bin/rspec
abbr -a hpr hub pull-request --no-edit --browse

function cat --wraps cat
    if type -q bat
        bat $argv
    end
end

begin
    set -l local
end

echo $HOMEDIR

__fish_append
__fish_complete_groups

echo.foo

hello | world

echo foo * bar

begin
    set -l local
end
echo "hello $USER"

foo --bar --ack

echo '$HOME is where the heart lives'

echo \a \n \~ \? \* \# \< \> \& \^ \( \) \x9 \Xaf \011 \u9 \U9 \ci \x18
echo \| \; \" \' \{ \} \[ \]

echo "\" \$ \\" '\\' "\\"
echo "\
"
echo 'foo \a \' \`'

echo xxx

echo * >out
echo &

hello | world

echo xaf x12 x12 \x12
echo $__fish_bin_dir
echo $__fish_bin_dirxxx

function add_to_path
    if not test -d $argv[1]
        return
    end
    for path in $PATH
        if test $argv[1] = $path
            return
        end
    end
    set -x PATH $PATH $argv[1]
end


ls
foobar
__fish_append

pwd
fish_mode_prompt
string-split0

argparse

echo $pipestatus $foo $history

@@@test
@@@ test
x && test
foo | bar
foo (bar)
function f
    begin
        set -l ack $PATH
    end
    for path in $PATH
        if [ $path = 'foo' ]
            continue
        else if [ $path = 'bar' ]
            break
        else if [ $path = 'ack' ]
            return
        end
    end
end

switch $animal
    case cat
        echo evil
    case wolf dog human moose dolphin whale
        echo mammal
    case duck goose albatross
        echo bird
    case shark trout stingray
        echo fish
        # Note that the next case has a wildcard which is quoted
    case '*'
        echo I have no idea what a $animal is
end

exit 5
source ~/foo.fish
