const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getLegacyBaseUrl() {
  const explicitBaseUrl = process.env.MEDIA_BASE_URL?.trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/g, '');
  }

  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const region = process.env.AWS_S3_REGION?.trim();

  if (!bucket || !region) {
    throw new Error('MEDIA_BASE_URL or AWS_S3_BUCKET/AWS_S3_REGION is required');
  }

  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

function toKey(baseUrl, value) {
  if (!value || typeof value !== 'string') {
    return value;
  }

  const normalizedBase = `${baseUrl}/`;
  return value.startsWith(normalizedBase) ? value.slice(normalizedBase.length) : value;
}

async function migrateTable(table, idColumn, columns, baseUrl) {
  const whereClause = columns.map((column) => `\`${column}\` LIKE ?`).join(' OR ');
  const params = columns.map(() => `${baseUrl}/%`);

  const rows = await prisma.$queryRawUnsafe(
    `SELECT \`${idColumn}\`, ${columns.map((column) => `\`${column}\``).join(', ')} FROM \`${table}\` WHERE ${whereClause}`,
    ...params,
  );

  let updatedCount = 0;

  for (const row of rows) {
    const data = {};

    for (const column of columns) {
      if (typeof row[column] === 'string') {
        const nextValue = toKey(baseUrl, row[column]);
        if (nextValue !== row[column]) {
          data[column] = nextValue;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      continue;
    }

    const assignments = Object.keys(data)
      .map((column) => `\`${column}\` = ?`)
      .join(', ');
    const values = Object.keys(data).map((column) => data[column]);

    await prisma.$executeRawUnsafe(
      `UPDATE \`${table}\` SET ${assignments} WHERE \`${idColumn}\` = ?`,
      ...values,
      row[idColumn],
    );

    updatedCount += 1;
  }

  return updatedCount;
}

async function main() {
  const baseUrl = getLegacyBaseUrl();

  const tables = [
    { table: 'artists', idColumn: 'id', columns: ['avatar_url', 'cover_url'] },
    { table: 'albums', idColumn: 'id', columns: ['cover_url'] },
    { table: 'songs', idColumn: 'id', columns: ['audio_url', 'cover_url', 'preview_url', 'lyrics_url'] },
    { table: 'genres', idColumn: 'id', columns: ['image_url'] },
    { table: 'playlists', idColumn: 'id', columns: ['image_url'] },
    { table: 'users', idColumn: 'id', columns: ['avatar_url'] },
    { table: 'advertisements', idColumn: 'id', columns: ['media_url'] },
  ];

  for (const item of tables) {
    const count = await migrateTable(item.table, item.idColumn, item.columns, baseUrl);
    console.log(`${item.table}: updated ${count} row(s)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

