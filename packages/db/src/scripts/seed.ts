import { execSync } from 'child_process';

const { DATABASE_URL } = process.env;

if (process.argv[2]) {
  if (process.argv[2] === 'export') {
    execSync(
      `pg_dump -Fc --data-only --exclude-table _prisma_migrations ${DATABASE_URL} > data/seed.dump`
    );
  } else {
    console.error('usage: nx run db:seed [export]');
  }
} else {
  execSync(
    `pg_restore -Fc --format=custom --dbname="${DATABASE_URL}" data/seed.dump`
  );
}
