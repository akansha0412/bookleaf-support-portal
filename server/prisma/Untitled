
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

interface SampleBook {
  book_id: string;
  title: string;
  isbn?: string | null;
  genre?: string | null;
  publication_date?: string | null;
  status: string;
  mrp?: number | null;
  author_royalty_per_copy?: number | null;
  total_copies_sold?: number;
  total_royalty_earned?: number;
  royalty_paid?: number;
  royalty_pending?: number;
  last_royalty_payout_date?: string | null;
  print_partner?: string | null;
  available_on?: string[];
}

interface SampleAuthor {
  author_id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  joined_date?: string | null;
  books: SampleBook[];
}

interface SampleData {
  authors: SampleAuthor[];
}

function parseDate(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authorPassword = process.env.AUTHOR_DEMO_PASSWORD;

  if (!adminEmail || !adminPassword || !authorPassword) {
    throw new Error(
      'Set ADMIN_EMAIL, ADMIN_PASSWORD and AUTHOR_DEMO_PASSWORD in server/.env',
    );
  }

  if (adminPassword.length < 12 || authorPassword.length < 12) {
    throw new Error('Demo passwords must be at least 12 characters long.');
  }

  const dataPath = path.resolve(
    process.cwd(),
    'bookleaf_sample_data.json',
  );

  const fileContent = await readFile(dataPath, 'utf8');
  const data = JSON.parse(fileContent) as SampleData;

  const authorPasswordHash = await bcrypt.hash(authorPassword, 12);
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  let booksImported = 0;

  for (const sampleAuthor of data.authors) {
    const author = await prisma.author.upsert({
      where: { sourceId: sampleAuthor.author_id },
      update: {
        name: sampleAuthor.name,
        email: sampleAuthor.email,
        phone: sampleAuthor.phone ?? null,
        city: sampleAuthor.city ?? null,
        joinedDate: parseDate(sampleAuthor.joined_date),
        role: 'AUTHOR',
      },
      create: {
        sourceId: sampleAuthor.author_id,
        name: sampleAuthor.name,
        email: sampleAuthor.email,
        passwordHash: authorPasswordHash,
        phone: sampleAuthor.phone ?? null,
        city: sampleAuthor.city ?? null,
        joinedDate: parseDate(sampleAuthor.joined_date),
        role: 'AUTHOR',
      },
    });

    for (const sampleBook of sampleAuthor.books ?? []) {
      await prisma.book.upsert({
        where: { sourceId: sampleBook.book_id },
        update: {
          authorId: author.id,
          title: sampleBook.title,
          isbn: sampleBook.isbn ?? null,
          genre: sampleBook.genre ?? null,
          publicationDate: parseDate(sampleBook.publication_date),
          status: sampleBook.status,
          mrp: sampleBook.mrp ?? null,
          authorRoyaltyPerCopy:
            sampleBook.author_royalty_per_copy ?? null,
          totalCopiesSold: sampleBook.total_copies_sold ?? 0,
          totalRoyaltyEarned: sampleBook.total_royalty_earned ?? 0,
          royaltyPaid: sampleBook.royalty_paid ?? 0,
          royaltyPending: sampleBook.royalty_pending ?? 0,
          lastRoyaltyPayoutDate: parseDate(
            sampleBook.last_royalty_payout_date,
          ),
          printPartner: sampleBook.print_partner ?? null,
          availableOn: sampleBook.available_on ?? [],
        },
        create: {
          sourceId: sampleBook.book_id,
          authorId: author.id,
          title: sampleBook.title,
          isbn: sampleBook.isbn ?? null,
          genre: sampleBook.genre ?? null,
          publicationDate: parseDate(sampleBook.publication_date),
          status: sampleBook.status,
          mrp: sampleBook.mrp ?? null,
          authorRoyaltyPerCopy:
            sampleBook.author_royalty_per_copy ?? null,
          totalCopiesSold: sampleBook.total_copies_sold ?? 0,
          totalRoyaltyEarned: sampleBook.total_royalty_earned ?? 0,
          royaltyPaid: sampleBook.royalty_paid ?? 0,
          royaltyPending: sampleBook.royalty_pending ?? 0,
          lastRoyaltyPayoutDate: parseDate(
            sampleBook.last_royalty_payout_date,
          ),
          printPartner: sampleBook.print_partner ?? null,
          availableOn: sampleBook.available_on ?? [],
        },
      });

      booksImported += 1;
    }
  }

  await prisma.author.upsert({
    where: { email: adminEmail },
    update: {
      name: 'BookLeaf Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      sourceId: 'BOOKLEAF_ADMIN_001',
      name: 'BookLeaf Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Authors processed: ${data.authors.length}`);
  console.log(`Books processed: ${booksImported}`);
  console.log(`Demo admin email: ${adminEmail}`);
}

main()
  .catch((error: unknown) => {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });