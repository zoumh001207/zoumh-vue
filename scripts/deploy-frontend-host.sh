#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_PATH="${ARCHIVE_PATH:-/zoumh/java/zmh/frontend/frontend-dist.tgz}"
ARCHIVE_DIR="${ARCHIVE_DIR:-/zoumh/java/zmh/frontend}"
HTML_DIR="${HTML_DIR:-/zoumh/java/zmh/frontend/html}"
NGINX_CONF_DIR="${NGINX_CONF_DIR:-/zoumh/java/zmh/frontend/nginx}"
NGINX_CONF_PATH="${NGINX_CONF_PATH:-${NGINX_CONF_DIR}/default.conf}"
NGINX_IMAGE="${NGINX_IMAGE:-nginx:1.27-alpine}"
NGINX_CONTAINER_NAME="${NGINX_CONTAINER_NAME:-ruoyi-nginx}"
FRONTEND_PROXY_PASS="${FRONTEND_PROXY_PASS:-http://127.0.0.1:8080/}"

mkdir -p "${ARCHIVE_DIR}" "${HTML_DIR}" "${NGINX_CONF_DIR}"

ensure_docker_shell_env() {
  local docker_bin docker_dir env_file helper_file bashrc_snippet
  docker_bin="$(command -v docker || true)"
  if [[ -z "${docker_bin}" ]]; then
    echo "docker command not found in deploy environment" >&2
    exit 1
  fi

  docker_dir="$(dirname "${docker_bin}")"
  env_file="/etc/profile.d/zoumh-docker.sh"
  helper_file="/zoumh/sh/docker.sh"
  bashrc_snippet="# zoumh docker env"

  mkdir -p /etc/profile.d /zoumh/sh
  ln -sf "${docker_bin}" /usr/local/bin/docker || true
  ln -sf "${docker_bin}" /usr/bin/docker || true

  cat > "${env_file}" <<EOF
export DOCKER_HOME='${docker_dir}'
case ":\$PATH:" in
  *:"${docker_dir}":*) ;;
  *) export PATH="${docker_dir}:\$PATH" ;;
esac
EOF
  chmod 644 "${env_file}"

  if ! grep -Fq "${bashrc_snippet}" /etc/bashrc 2>/dev/null; then
    cat >> /etc/bashrc <<EOF

${bashrc_snippet}
if [ -f /etc/profile.d/zoumh-docker.sh ]; then
  . /etc/profile.d/zoumh-docker.sh
fi
EOF
  fi

  mkdir -p /root
  for shell_file in /root/.bashrc /root/.bash_profile; do
    touch "${shell_file}"
    if ! grep -Fq "${bashrc_snippet}" "${shell_file}"; then
      cat >> "${shell_file}" <<EOF

${bashrc_snippet}
if [ -f /etc/profile.d/zoumh-docker.sh ]; then
  . /etc/profile.d/zoumh-docker.sh
fi
EOF
    fi
  done

  cat > "${helper_file}" <<EOF
#!/usr/bin/env bash
set -e
export DOCKER_HOME='${docker_dir}'
case ":\$PATH:" in
  *:"${docker_dir}":*) ;;
  *) export PATH="${docker_dir}:\$PATH" ;;
esac

if [[ \$# -eq 0 ]]; then
  exec "${docker_bin}" --version
fi

exec "${docker_bin}" "\$@"
EOF
  chmod +x "${helper_file}"
}

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

tmp_dir="$(mktemp -d "${ARCHIVE_DIR%/}/frontend.tmp.XXXXXX")"
trap 'rm -rf "${tmp_dir}"' EXIT

tar -xzf "${ARCHIVE_PATH}" -C "${tmp_dir}"
find "${HTML_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a "${tmp_dir}/." "${HTML_DIR}/"

cat > "${NGINX_CONF_PATH}" <<EOF
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /prod-api/ {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass ${FRONTEND_PROXY_PASS};
    }

    location ~* /actuator {
        return 403;
    }
}
EOF

ensure_docker_shell_env

if command -v ss >/dev/null 2>&1; then
  if ss -ltnp 2>/dev/null | grep -q ':80 ' && ! docker ps --format '{{.Names}}' | grep -qx "${NGINX_CONTAINER_NAME}"; then
    echo "port 80 is already in use, cannot start ${NGINX_CONTAINER_NAME}" >&2
    exit 1
  fi
fi

docker rm -f "${NGINX_CONTAINER_NAME}" >/dev/null 2>&1 || true

docker run -d \
  --name "${NGINX_CONTAINER_NAME}" \
  --restart unless-stopped \
  --network host \
  -v "${HTML_DIR}:/usr/share/nginx/html:ro" \
  -v "${NGINX_CONF_PATH}:/etc/nginx/conf.d/default.conf:ro" \
  "${NGINX_IMAGE}" >/dev/null

if [[ -n "${POST_DEPLOY_CMD:-}" ]]; then
  sh -lc "${POST_DEPLOY_CMD}"
fi

docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E "^${NGINX_CONTAINER_NAME}[[:space:]]" || true
echo "frontend deployed to container ${NGINX_CONTAINER_NAME}"
