#!/usr/bin/env bash
set -euo pipefail

rm -rf ./.wrangler/state/v3/d1 && wrangler d1 execute phikap-db --file=./schema.sql && wrangler d1 execute phikap-db --file=./seed.sql

./start.sh
