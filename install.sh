\#\!/bin/bash

nc='\\033[0m'
bold='\\033[1m'
cyan='\\033[0;36m'
green='\\033[0;32m'
red='\\033[0;31m'
white='\\033[1;37m'

app\_name="brainrot ui"
repo="nyxolz/brainrotui"

clear
echo -e "${cyan}--------------------------------------------------${nc}"
echo -e "${bold}${white}  installation: ${app_name}${nc}"
echo -e "${cyan}--------------------------------------------------${nc}"

release\_data=$(curl -s "[https://api.github.com/repos/$repo/releases/latest](https://www.google.com/search?q=https://api.github.com/repos/$repo/releases/latest)")
download_url=$(echo "$release_data" | grep -o '[https://github.com/](https://github.com/)[^"]*arm64\.dmg' | head -n 1)
dmg_name=$(basename "$download\_url")

if [ -z "$download_url" ]; then
echo -e "${red}status: could not find an arm64 dmg in the latest release.${nc}"
exit 1
fi

if [[ $euid -eq 0 ]]; then
dest="/applications"
echo -e "${cyan}mode:${nc} system-wide (admin)"
else
dest="$home/applications"
echo -e "${cyan}mode:${nc} user-only (non-admin)"
fi

echo -e "${bold}[1/4]${nc} downloading $dmg_name..."
curl -l -f -o "/tmp/$dmg\_name" "$download\_url" --progress-bar

if [ $? -ne 0 ]; then
echo -e "${red}status: download failed.${nc}"
exit 1
fi

mkdir -p "$dest"

echo -e "${bold}[2/4]${nc} preparing filesystem..."
mount\_dir=$(hdiutil mount "/tmp/$dmg\_name" | tail -n1 | perl -nle '/(/volumes/.\*)/; print $1')

echo -e "${bold}[3/4]${nc} deploying to ${white}$dest${nc}..."
rm -rf "$dest/${app_name}.app"
cp -r "$mount\_dir/"\*.app "$dest/"

echo -e "${bold}[4/4]${nc} finalizing..."
hdiutil detach "$mount_dir" > /dev/null
rm "/tmp/$dmg\_name"

xattr -rd com.apple.quarantine "$dest/"\*.app 2\>/dev/null

echo -e "${cyan}--------------------------------------------------${nc}"
echo -e "${green}${bold}success:${nc} ${white}${app\_name} is now updated.${nc}"
echo -e "${cyan}--------------------------------------------------${nc}"
