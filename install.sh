#!/bin/bash

nc='\033[0m'; bold='\033[1m'
cyan='\033[0;36m'; green='\033[0;32m'
red='\033[0;31m'; white='\033[1;37m'; dim='\033[2m'

repo="${repo:-nyxolz/brainrotui}"
app_name="${app_name:-brainrot ui}"
version_file="$HOME/.config/brainrotui/.version"

die() { printf "${red}✗ %s${nc}\n" "$*"; exit 1; }
info() { printf "${cyan}▸${nc} %s\n" "$*"; }
ok() { printf "${green}✓${nc} %s\n" "$*"; }
step() { printf "${bold}${white}[%s]${nc} %s\n" "$1" "$2"; }
bar() { printf "${dim}────────────────────────────────────────────────${nc}\n"; }

clear
bar
printf "  ${bold}${white}%-24s${nc}  ${dim}%s${nc}\n" "$app_name" "installer · auto-update"
bar

step "1/5" "fetching latest release..."
release_data=$(curl -fsSL "https://api.github.com/repos/$repo/releases/latest") || die "github api request failed"

remote_tag=$(echo "$release_data" | grep -m1 '"tag_name"' | grep -o '"v[^"]*"' | tr -d '"')
download_url=$(echo "$release_data" | grep -o 'https://github.com/[^"]*.dmg' | head -n1)
dmg_name=$(basename "$download_url")

[ -z "$download_url" ] && die "no .dmg found in latest release ($remote_tag)"

local_tag=""
[ -f "$version_file" ] && local_tag=$(cat "$version_file")

if [ "$local_tag" = "$remote_tag" ]; then
    ok "already on latest: ${white}$remote_tag${nc}"
    bar
    exit 0
fi

if [ -n "$local_tag" ]; then
    info "update available: ${dim}$local_tag${nc} → ${white}$remote_tag${nc}"
else
    info "installing ${white}$remote_tag${nc}"
fi

if [[ $EUID -eq 0 ]]; then
    dest="/Applications"
    info "mode: system-wide (admin)"
else
    dest="$HOME/Applications"
    info "mode: user-only (non-admin)"
fi

step "2/5" "downloading ${white}$dmg_name${nc}..."
tmp_dmg="/tmp/$dmg_name"
curl -L -f --progress-bar -o "$tmp_dmg" "$download_url" || die "download failed"

step "3/5" "mounting disk image..."
mount_output=$(hdiutil attach "$tmp_dmg" -nobrowse -noautoopen 2>&1)
mount_dir=$(echo "$mount_output" | tail -n1 | perl -nle '/(\/Volumes\/.*)/; print $1')
[ -z "$mount_dir" ] && die "failed to mount dmg"

step "4/5" "deploying to ${white}$dest${nc}..."
mkdir -p "$dest"

app_src=$(find "$mount_dir" -maxdepth 1 -name "*.app" | head -n1)
[ -z "$app_src" ] && { hdiutil detach "$mount_dir" >/dev/null; die "no .app found in dmg"; }

app_bundle=$(basename "$app_src")
rm -rf "$dest/$app_bundle"
cp -r "$app_src" "$dest/$app_bundle" || { hdiutil detach "$mount_dir" >/dev/null; die "copy failed"; }

step "5/5" "finalizing..."
hdiutil detach "$mount_dir" >/dev/null 2>&1
rm -f "$tmp_dmg"

xattr -rd com.apple.quarantine "$dest/$app_bundle" 2>/dev/null

mkdir -p "$(dirname "$version_file")"
echo "$remote_tag" > "$version_file"

bar
printf "  ${green}${bold}success:${nc}  ${white}%s${nc} ${dim}%s${nc}\n" "$app_bundle" "$remote_tag"
bar
printf "  ${dim}run:${nc} open \"$dest/$app_bundle\"\n\n"
 
