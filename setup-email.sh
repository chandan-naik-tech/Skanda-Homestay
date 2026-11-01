#!/usr/bin/env bash
# Connect your Gmail to the website and send a test email. Run:  ./setup-email.sh
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then exec node backend/setup-email.mjs "$@"; else echo "Node.js is not installed. Install the LTS version from https://nodejs.org"; exit 1; fi
