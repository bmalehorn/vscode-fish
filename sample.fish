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