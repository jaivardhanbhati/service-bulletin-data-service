#!/usr/bin/env bash

# Stop on errors
set -e
# piped commands return the exit status of the last command in the pipe that returned non-zero
set -o pipefail

# Get dependencies from NPM
npm install

# Run tests
npm test

# Lint code
npm run lint

# Dist
# Cleanup first
rm -rf dist
mkdir dist

# Ship application
npm run dist

# Create artifact
ARTIFACT_VERSION=$(node -p "require('./package.json').version")
ARTIFACT_NAME=$(node -p "require('./package.json').name")
rm -f *.tar.gz
tar -zcvf $ARTIFACT_NAME-$ARTIFACT_VERSION-$BUILD_NUMBER.tar.gz dist *.sh manifest.yml
