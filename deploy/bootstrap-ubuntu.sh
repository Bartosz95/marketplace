#!/usr/bin/env bash
set -euo pipefail

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  awscli \
  docker.io \
  docker-compose-v2 \
  git

systemctl enable --now docker
install -d -o ubuntu -g ubuntu /opt/marketplace
git clone --branch main --depth 1 \
  https://github.com/Bartosz95/marketplace.git /opt/marketplace
