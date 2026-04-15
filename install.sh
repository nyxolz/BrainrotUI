#!/bin/bash

nc='\033[0m'
bold='\033[1m'
cyan='\033[0;36m'
green='\033[0;32m'
red='\033[0;31m'
white='\033[1;37m'

app_name="brainrot ui"
repo="nyxolz/brainrotui"

clear
printf "${cyan}--------------------------------------------------${nc}\n"
printf "${bold}${white}  installation: ${app_name}${nc}\n"
printf "${cyan}--------------------------------------------------${nc}\n"

release_data=$(curl -s "https://api.github.com/repos/$repo/releases/latest")
download_url=$(echo "$release_data" | grep -o 'https://github.com/[^"]*arm64\.dmg' | head -n 1)
dmg_name=$(basename "$download_url")

if [ -z "$download_url" ]; then
    printf "${red}status: could not find an arm64 dmg in the latest release.${nc}\n"
    exit 1
fi

if [[ $EUID -eq 0 ]]; then
    dest="/Applications"
    printf "${cyan}mode:${nc} system-wide (admin)\n"
else
    dest="$HOME/Applications"
    printf "${cyan}mode:${nc} user-only (non-admin)\n"
fi

printf "${bold}[1/4]${nc} downloading $dmg_name...\n"
curl -L -f -o "/tmp/$dmg_name" "$download_url" --progress-bar

if [ $? -ne 0 ]; then
    printf "${red}status: download failed.${nc}\n"
    exit 1
fi

mkdir -p "$dest"

printf "${bold}[2/4]${nc} preparing filesystem...\n"
mount_dir=$(hdiutil mount "/tmp/$dmg_name" | tail -n1 | perl -nle '/(\/Volumes\/.*)/; print $1')

printf "${bold}[3/4]${nc} deploying to ${white}$dest${nc}...\n"
rm -rf "$dest/${app_name}.app"
cp -r "$mount_dir/"*.app "$dest/"

printf "${bold}[4/4]${nc} finalizing...\n"
hdiutil detach "$mount_dir" > /dev/null
rm "/tmp/$dmg_name"

xattr -rd com.apple.quarantine "$dest/"*.app 2>/dev/null

printf "${cyan}--------------------------------------------------${nc}\n"
printf "${green}${bold}success:${nc} ${white}${app_name} is now updated.${nc}\n"
printf "${cyan}--------------------------------------------------${nc}\n"
