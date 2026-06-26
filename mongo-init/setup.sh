#!/bin/bash
set -e

# Generate keyfile (idempotent — only if it doesn't exist)
if [ ! -f /etc/mongodb-keyfile ]; then
  openssl rand -base64 756 > /etc/mongodb-keyfile
fi
chmod 400 /etc/mongodb-keyfile
chown 999:999 /etc/mongodb-keyfile

# ── PHASE 1: Start WITHOUT auth to do one-time init ─────────────────────────
# Only needed on first boot (no admin user yet).
# We detect first boot by checking for a sentinel file.

SENTINEL="/data/db/.replica_initialized"

if [ ! -f "$SENTINEL" ]; then
  echo "=== First boot: initializing replica set and admin user ==="

  # Start mongod without auth for init
  docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /etc/mongodb-keyfile &
  MONGOD_PID=$!

  # Wait for mongod to accept connections
  echo "Waiting for mongod to be ready..."
  until mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    sleep 2
  done
  echo "mongod is ready"

  # Init replica set
  mongosh --quiet --eval "
    const status = rs.initiate({
      _id: 'rs0',
      members: [{ _id: 0, host: 'mongodb:27017' }]
    });
    print('rs.initiate result: ' + JSON.stringify(status));
  "

  # Wait for primary election
  echo "Waiting for primary election..."
  until mongosh --quiet --eval "db.isMaster().ismaster" 2>/dev/null | grep -q true; do
    sleep 1
  done
  echo "Primary elected"

  # Create admin user
  mongosh admin --quiet --eval "
    db.createUser({
      user: 'admin',
      pwd: 'password123',
      roles: [{ role: 'root', db: 'admin' }]
    });
    print('Admin user created');
  "

  # Mark initialization complete
  touch "$SENTINEL"

  # Shut down the no-auth instance cleanly
  mongosh --quiet --eval "db.adminCommand({ shutdown: 1 })" || true
  wait $MONGOD_PID || true
  echo "=== First-boot init complete ==="

else
  echo "=== Sentinel found: skipping first-boot init ==="
fi

# ── PHASE 2: Start WITH auth — this becomes PID 1 ───────────────────────────
echo "Starting mongod with auth..."
exec docker-entrypoint.sh mongod \
  --replSet rs0 \
  --bind_ip_all \
  --keyFile /etc/mongodb-keyfile \
  --auth