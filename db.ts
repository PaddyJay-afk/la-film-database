import { eq, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, films, reviews, filmStreaming, streamingPlatforms, filmSubmissions, InsertFilmSubmission } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all films with optional filtering
 */
export async function getFilms(filters?: {
  year?: number;
  genre?: string;
  platformId?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(films);

  if (filters?.search) {
    query = query.where(
      sql`${films.title} LIKE ${`%${filters.search}%`}`
    );
  } else {
    query = query.where(sql`1=1`);
  }

  if (filters?.year) {
    query = query.where(eq(films.year, filters.year));
  }

  if (filters?.genre) {
    query = query.where(
      sql`${films.genres} LIKE ${`%${filters.genre}%`}`
    );
  }

  return query.orderBy(desc(films.year), asc(films.title)).execute();
}

/**
 * Get a single film with all related data
 */
export async function getFilmById(filmId: number) {
  const db = await getDb();
  if (!db) return null;

  const film = await db.select().from(films).where(eq(films.id, filmId)).limit(1);
  if (!film.length) return null;

  const filmReviews = await db.select().from(reviews).where(eq(reviews.filmId, filmId));
  const filmPlatforms = await db
    .select({
      platform: streamingPlatforms,
      url: filmStreaming.url,
    })
    .from(filmStreaming)
    .innerJoin(streamingPlatforms, eq(filmStreaming.platformId, streamingPlatforms.id))
    .where(eq(filmStreaming.filmId, filmId));

  return {
    ...film[0],
    reviews: filmReviews,
    platforms: filmPlatforms,
  };
}

/**
 * Get all streaming platforms
 */
export async function getStreamingPlatforms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(streamingPlatforms).orderBy(asc(streamingPlatforms.name));
}

/**
 * Create a film submission
 */
export async function createFilmSubmission(data: InsertFilmSubmission) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(filmSubmissions).values(data);
}

/**
 * Get pending film submissions
 */
export async function getPendingSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(filmSubmissions)
    .where(eq(filmSubmissions.status, "pending"))
    .orderBy(asc(filmSubmissions.createdAt));
}
