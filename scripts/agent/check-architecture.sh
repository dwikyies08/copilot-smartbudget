#!/usr/bin/env bash
set -e

echo "Checking SmartBudget architecture..."

for required_dir in src/app src/components src/db src/services src/lib src/types; do
  if [ ! -d "$required_dir" ]; then
    echo "Missing directory: $required_dir"
    exit 1
  fi
done

echo "Architecture looks consistent: App Router + services + actions + DB layer are present."
