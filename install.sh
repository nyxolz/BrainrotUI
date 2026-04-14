#!/bin/bash

NC='\033[0m'
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
WHITE='\033[1;37m'

APP_NAME="Brainrot UI"
DMG_NAME="Brainrot.UI-1.0.1-arm64.dmg"
DOWNLOAD_URL="https://github.com/nyxolz/BrainrotUI/releases/download/v1.0.1/$DMG_NAME"

clear
echo -e "${CYAN}--------------------------------------------------${NC}"
echo -e "${BOLD}${WHITE}  INSTALLATION: ${APP_NAME}${NC}"
echo -e "${CYAN}--------------------------------------------------${NC}"

if [[ $EUID -eq 0 ]]; then
    DEST="/Applications"
    echo -e "${CYAN}MODE:${NC} System-wide (Admin)"
else
    DEST="$HOME/Applications"
    echo -e "${CYAN}MODE:${NC} User-only (Non-Admin)"
fi

echo -e "${BOLD}[1/4]${NC} Fetching remote assets..."
curl -L -f -o "/tmp/$DMG_NAME" "$DOWNLOAD_URL" --progress-bar

if [ $? -ne 0 ]; then
    echo -e "${RED}Status: Download failed. Verify source URL.${NC}"
    exit 1
fi

mkdir -p "$DEST"

echo -e "${BOLD}[2/4]${NC} Preparing filesystem..."
MOUNT_DIR=$(hdiutil mount "/tmp/$DMG_NAME" | tail -n1 | perl -nle '/(\/Volumes\/.*)/; print $1')

echo -e "${BOLD}[3/4]${NC} Deploying to ${WHITE}$DEST${NC}..."
cp -R "$MOUNT_DIR/"*.app "$DEST/"

echo -e "${BOLD}[4/4]${NC} Finalizing configuration..."
hdiutil detach "$MOUNT_DIR" > /dev/null
rm "/tmp/$DMG_NAME"

xattr -rd com.apple.quarantine "$DEST/"*.app 2>/dev/null

echo -e "${CYAN}--------------------------------------------------${NC}"
echo -e "${GREEN}${BOLD}SUCCESS:${NC} ${WHITE}${APP_NAME} is now installed.${NC}"
echo -e "${CYAN}--------------------------------------------------${NC}"
