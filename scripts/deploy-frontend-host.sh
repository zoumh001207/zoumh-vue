#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_PATH="${ARCHIVE_PATH:-/zoumh/java/zmh/frontend/frontend-dist.tgz}"
ARCHIVE_DIR="${ARCHIVE_DIR:-/zoumh/java/zmh/frontend}"
HTML_DIR="${HTML_DIR:-/zoumh/data/nginx/www}"

mkdir -p "${ARCHIVE_DIR}" "${HTML_DIR}"

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

tmp_dir="$(mktemp -d "${HTML_DIR%/}.tmp.XXXXXX")"
trap 'rm -rf "${tmp_dir}"' EXIT

tar -xzf "${ARCHIVE_PATH}" -C "${tmp_dir}"
find "${HTML_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a "${tmp_dir}/." "${HTML_DIR}/"

if [[ -n "${POST_DEPLOY_CMD:-}" ]]; then
  sh -lc "${POST_DEPLOY_CMD}"
fi

echo "frontend deployed to ${HTML_DIR}"
