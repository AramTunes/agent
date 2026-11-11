#!/bin/sh
set -e
cd /workspace
mkdir -p /workspace/data /workspace/.grok
export PATH="/workspace/.tools/go/bin:$PATH"
SOCK="${AGENT_SOCK:-/workspace/data/agent.sock}"
if ! curl --unix-socket "$SOCK" -sf -o /dev/null --max-time 1 http://localhost/api/v1/health; then
  rm -f "$SOCK"
  if [ ! -x /workspace/api/bin/agent-api ]; then
    (cd /workspace/api && go build -o /workspace/api/bin/agent-api ./cmd/server)
  fi
  AGENT_DB=/workspace/data/agent.db AGENT_ADDR="$SOCK" \
    nohup /workspace/api/bin/agent-api >> /workspace/.grok/go-api.log 2>&1 &
  i=0
  while [ "$i" -lt 40 ]; do
    curl --unix-socket "$SOCK" -sf -o /dev/null --max-time 1 http://localhost/api/v1/health && break
    i=$((i + 1))
    sleep 0.25
  done
fi
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >> /workspace/.grok/dev.log 2>&1 &
i=0
while [ "$i" -lt 60 ]; do
  curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/ && exit 0
  i=$((i + 1))
  sleep 0.5
done
exit 1
