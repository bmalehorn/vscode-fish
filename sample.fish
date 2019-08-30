# https://fishshell.com/docs/current/tutorial.html
# https://github.com/jorgebucaran/awesome-fish

function add_to_path
    if not test -d $argv[1]
        return
    end
    for path in $PATH
        if test $argv[1] = $path
            return
        end
    end
    if test "$argv[2]" = prepend
        set -x PATH $argv[1] $PATH
    else
        set -x PATH $PATH $argv[1]
    end
end

# https://github.com/fish-shell/fish-shell/issues/2639
function remove_from_path
    if set -l ind (contains -i -- $argv[1] $PATH)
        set -e PATH[$ind]
    end
end

remove_from_path ~/bin
add_to_path ~/bin prepend
add_to_path ~/.cargo/bin prepend
add_to_path ~/miniconda3/bin prepend

add_to_path ~/.cask/bin
add_to_path ~/build/depot_tools
add_to_path ~/miniconda2/bin
add_to_path ~/Library/Android/sdk/tools
add_to_path ~/Library/Android/sdk/platform-tools
set -x GOPATH ~/go
add_to_path "$GOPATH/bin"
add_to_path /usr/local/Cellar/gettext/0.19.8.1/bin
add_to_path ~/.ebcli-virtual-env/executables

# tmuxinator / asdf junk
remove_from_path .
# put these in front by sourcing asdf
remove_from_path ~/.asdf/shims
remove_from_path ~/.asdf/bin
remove_from_path $GOPATH/bin

function fish-ssh-agent
    begin
        set -l bmalehorn_hostname (hostname)
        if test -f ~/.keychain/$bmalehorn_hostname-fish
            source ~/.keychain/$bmalehorn_hostname-fish
        end
    end
end

fish-ssh-agent

if type -q code
    set -x EDITOR 'code --wait'
end

if type -q rg
    set -x FZF_DEFAULT_COMMAND 'rg "" -l'
end

set -x LANG 'en_US.UTF-8'
set -x LC_ALL 'en_US.UTF-8'
set -x SLUGIFY_USES_TEXT_UNIDECODE yes

# https://github.com/oh-my-fish/theme-bobthefish
set -g theme_newline_cursor yes
set -g theme_title_display_process yes
set -g theme_display_cmd_duration no
set -g theme_nerd_fonts yes
set -g theme_display_date no
set -g theme_display_ruby no
set -g FZF_FIND_FILE_COMMAND 'fd --type f --hidden . $dir'

abbr -a yt yarn test
abbr -a brs bin/rspec
abbr -a brt bin/rails test
abbr -a bss bin/spring stop
abbr -a brc bin/rails console
abbr -a fn 'fd -F'
abbr -a fa 'fd -IF'
abbr -a uniqc 'sort | uniq -c | sort -n'
abbr -a green hub pull-request --no-edit --browse --push --copy --labels merge-when-green
abbr -a hpr hub pull-request --no-edit --browse --push --copy
abbr -a e code
abbr -a lid 'cd (git rev-parse --show-toplevel)'

function bstow
    cd ~/Dropbox/stow
    stow -t ~/ -d ~/Dropbox/stow -v dotfiles
end

function ls --wraps ls
    if type -q lsd
        lsd -A $argv
    else
        command ls $argv
    end
end

function cat --wraps cat
    if type -q bat
        bat $argv
    end
end

function s --wraps rg
    rg \
        --colors line:fg:yellow --colors line:style:bold \
        --colors path:fg:green --colors path:style:bold \
        --smart-case --max-columns 2000 --max-count 100 --hidden \
        --glob '!.git/' --glob '!.repo/' --glob '!.svn/' \
        $argv
end

function less
    command less -R -n $argv
end


direnv hook fish | source
source ~/.asdf/asdf.fish
