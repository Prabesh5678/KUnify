#!/bin/bash
set -e

# Generate keyfile
openssl rand -base64 756 > /etc/mongodb-keyfile
chmod 400 /etc/mongodb-keyfile
chown 999:999 /etc/mongodb-keyfile

# Start MongoDB with replica set and keyfile
docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /etc/mongodb-keyfile &

# Wait for MongoDB to be ready
sleep 30

# Initialize replica set (no auth yet)
mongosh --eval "
  try {
    rs.status();
    print('Already initialized');
  } catch(e) {
    rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongodb:27017'}]});
    print('Replica set initialized');
  }
"

# Wait for primary to be elected
echo "Waiting for primary election..."
until mongosh --eval "db.isMaster().ismaster" --quiet | grep -q true; do
  sleep 1
done

# Create admin user
mongosh admin --eval "
  if (db.getUser('admin') === null) {
    db.createUser({
      user: 'admin',
      pwd: 'password123',
      roles: [{role: 'root', db: 'admin'}]
    });
    print('Admin user created');
  } else {
    print('Admin user already exists');
  }
"

# Shut down the no-auth instance
mongod --shutdown

# Restart with auth + keyfile enabled (this becomes PID 1, keeping container alive)
exec docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /etc/mongodb-keyfile --auth