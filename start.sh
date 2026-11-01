#!/usr/bin/env bash
# Start the homestay website (Mac / Linux). Run:  ./start.sh     (first time: chmod +x start.sh)
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  exec node start.mjs "$@"
else
  echo "Node.js is not installed. Install the LTS version from https://nodejs.org"
  exit 1
fi
