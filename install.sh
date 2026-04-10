#!/bin/bash

APP_NAME="Brainrot UI"

DMG_NAME="Brainrot.UI-1.0.0-arm64.dmg"
DOWNLOAD_URL="https://github.com/nyxolz/BrainrotUI/releases/download/v1.0/$DMG_NAME"

echo "------------------------------------------"
echo "  Installing $APP_NAME by nyxolz"
echo "------------------------------------------"


if [[ $EUID -eq 0 ]]; then
    DEST="/Applications"
else
    DEST="$HOME/Applications"
fi

mkdir -p "$DEST"

echo "-> Downloading from GitHub..."
curl -L -f -o "/tmp/$DMG_NAME" "$DOWNLOAD_URL"

if [ $? -ne 0 ]; then
    echo "Error: Download failed. Check if the version and filename are correct."
    exit 1
fi

echo "-> Mounting Disk Image..."

MOUNT_DIR=$(hdiutil mount "/tmp/$DMG_NAME" | tail -n1 | perl -nle '/(\/Volumes\/.*)/; print $1')

echo "-> Copying App to $DEST..."

cp -R "$MOUNT_DIR/"*.app "$DEST/$APP_NAME.app"

echo "-> Unmounting and Cleaning up..."
hdiutil detach "$MOUNT_DIR"
rm "/tmp/$DMG_NAME"

echo "-> removing quarantine flags"
xattr -rd com.apple.quarantine "$DEST/$APP_NAME.app" 2>/dev/null

echo "------------------------------------------"
echo "Done! You can find $APP_NAME in $DEST"
echo "------------------------------------------"
