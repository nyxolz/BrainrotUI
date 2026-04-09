#!/bin/bash

APP_NAME="Brainrot UI"
ZIP_NAME="brainrot-ui-1.0.0-arm64-mac.zip"
DOWNLOAD_URL="https://github.com/nyxolz/BrainrotUI/releases/download/v1.0/$ZIP_NAME"

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
curl -L -f -o "/tmp/$ZIP_NAME" "$DOWNLOAD_URL"

if [ $? -ne 0 ]; then
    echo "Error: Download failed. Verify that the file exists in the v1.0 release."
    exit 1
fi

if [ -d "$DEST/$APP_NAME.app" ]; then
    echo "-> Removing old version..."
    rm -rf "$DEST/$APP_NAME.app"
fi

echo "-> Extracting to $DEST..."
unzip -q -o "/tmp/$ZIP_NAME" -d "$DEST"

echo "-> Authorizing app..."
xattr -rd com.apple.quarantine "$DEST/$APP_NAME.app" 2>/dev/null

rm "/tmp/$ZIP_NAME"

echo "------------------------------------------"
echo "Done! You can find $APP_NAME in $DEST"
echo "------------------------------------------"
