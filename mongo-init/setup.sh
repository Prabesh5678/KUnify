#!/bin/bash

# Generate keyfile
openssl rand -base64 756 > /etc/mongodb-keyfile
chmod 400 /etc/mongodb-keyfile
chown 999:999 /etc/mongodb-keyfile

# Start MongoDB with replica set and keyfile
exec docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /etc/mongodb-keyfile &

# Wait for MongoDB to be ready
sleep 10

# Initialize replica set
mongosh -u admin -p password123 --authenticationDatabase admin --eval "
try {
  rs.status();
  print('Already initialized');
} catch(e) {
  rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongodb:27017'}]});
  print('Replica set initialized!');
}
"

# Keep container running
wait