#!/bin/bash
echo "Running database setup..."

# First push the schema
npx drizzle-kit push

# Then run the seed script
npx tsx scripts/schema-push.ts

echo "Database setup complete!"