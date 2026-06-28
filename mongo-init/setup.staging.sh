#!/bin/bash
set -e

SENTINEL="/data/db/.replica_initialized"

if [ ! -f "$SENTINEL" ]; then
  echo "=== First boot: initializing staging replica set and admin user ==="

  docker-entrypoint.sh mongod --replSet rs0-staging --bind_ip_all &
  MONGOD_PID=$!

  echo "Waiting for mongod to be ready..."
  until mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    sleep 2
  done
  echo "mongod is ready"

  mongosh --quiet --eval "
    const status = rs.initiate({
      _id: 'rs0-staging',
      members: [{ _id: 0, host: 'mongodb-staging:27017' }]
    });
    print('rs.initiate result: ' + JSON.stringify(status));
  "

  echo "Waiting for primary election..."
  until mongosh --quiet --eval "db.isMaster().ismaster" 2>/dev/null | grep -q true; do
    sleep 1
  done
  echo "Primary elected"

  mongosh admin --quiet --eval "
    db.createUser({
      user: 'admin',
      pwd: 'password123',
      roles: [{ role: 'root', db: 'admin' }]
    });
    print('Admin user created');
  "

  touch "$SENTINEL"

  mongosh --quiet --eval "db.adminCommand({ shutdown: 1 })" || true
  wait $MONGOD_PID || true
  echo "=== First-boot init complete ==="

else
  echo "=== Sentinel found: skipping first-boot init ==="
fi

# Generate keyfile fresh each boot
openssl rand -base64 756 > /etc/mongodb-keyfile
chmod 400 /etc/mongodb-keyfile
chown 999:999 /etc/mongodb-keyfile

echo "Starting mongod with auth..."
exec docker-entrypoint.sh mongod \
  --replSet rs0-staging \
  --bind_ip_all \
  --keyFile /etc/mongodb-keyfile \
  --auth