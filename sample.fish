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
