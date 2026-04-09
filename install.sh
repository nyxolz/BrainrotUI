#!/bin/bash

# Brainrot UI Installer

echo "Installing Brainrot UI..."

# Check if running as admin/root
if [[ $EUID -eq 0 ]]; then
    echo "Running as administrator"
    INSTALL_DIR="/Applications"
else
    echo "Running as user"
    INSTALL_DIR="$HOME/Applications"
fi

# Create install directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download the latest release
echo "Downloading latest release..."
curl -L -o "$INSTALL_DIR/brainrot-ui.zip" "https://github.com/nyxolz/BrainrotUI/releases/latest/download/brainrot-ui-mac.zip"

# Unzip
echo "Extracting..."
unzip -q "$INSTALL_DIR/brainrot-ui.zip" -d "$INSTALL_DIR"

# Clean up
rm "$INSTALL_DIR/brainrot-ui.zip"

echo "Installation complete!"
echo "App installed to: $INSTALL_DIR/Brainrot UI.app"