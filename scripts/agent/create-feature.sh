#!/usr/bin/env bash
set -e

FEATURE_NAME="${1:-feature}"

mkdir -p src/services src/components/forms src/app/actions

cat <<EOF > "src/app/actions/${FEATURE_NAME}-actions.ts"
"use server";

export async function submit${FEATURE_NAME^}(formData: FormData) {
  // Implement your server action here
  console.log("Submit", Object.fromEntries(formData.entries()));
}
EOF

echo "Generated feature scaffold for: ${FEATURE_NAME}"
echo "Files created in src/app/actions/${FEATURE_NAME}-actions.ts"
