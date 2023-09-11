#!/usr/bin/env bash
# test-utils/scripts/run-integration.sh

# Export env vars from .env.test file.
export $(grep -v '^#' .env.test | xargs)

# Name of docker container. This is the 'container_name' of the service in docker-compose file.
POSTGRES_CONTAINER_NAME="integration-tests-db"
# User to connect to the database with.
DB_USER="postgres"

# Check if the container exists.
CONTAINER_EXISTS=$(docker ps -a --filter "name=$POSTGRES_CONTAINER_NAME" --format "{{.Names}}")

# If the container does not exist, create it. Otherwise, skip creation.
if [ -z "$CONTAINER_EXISTS" ]; then
  echo '🟡 - Container does not exist. Creating...'
  yarn docker:up
else
  echo '🟡 - Container exists. Skipping creation.'
fi

echo '🟡 - Waiting for database to be ready...'

# Loop until the Postgres container is running.
while [ "$(docker inspect -f '{{.State.Status}}' $POSTGRES_CONTAINER_NAME)" != "running" ]; do
  sleep 1
done

# Loop until Postgres is ready to accept connections.
while ! docker exec $POSTGRES_CONTAINER_NAME pg_isready -U $DB_USER; do
  sleep 1
done

echo '🟢 - Database is ready!'

# Apply migrations.
yarn prisma migrate deploy --schema prisma/v2/schema.prisma

# Run tests.
jest --runInBand --verbose --watch