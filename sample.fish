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

echo \a \n \~ \? \* \% \# \< \> \& \^ \( \) \x9 \Xaf \011 \u9 \U9 \ci \x18

echo "\" \$ \\"
echo "\
"
echo 'foo \a \' \`'

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
