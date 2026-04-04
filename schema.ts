import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Streaming platforms reference table
 */
export const streamingPlatforms = mysqlTable("streaming_platforms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }), // hex color
  icon: text("icon"), // URL to icon
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StreamingPlatform = typeof streamingPlatforms.$inferSelect;
export type InsertStreamingPlatform = typeof streamingPlatforms.$inferInsert;

/**
 * Films table - core movie database
 */
export const films = mysqlTable("films", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  year: int("year").notNull(),
  synopsis: text("synopsis"),
  genres: varchar("genres", { length: 500 }), // comma-separated tags
  imdbId: varchar("imdbId", { length: 20 }),
  imdbUrl: varchar("imdbUrl", { length: 500 }),
  imdbRating: varchar("imdbRating", { length: 10 }), // e.g., "8.5/10"
  rottenTomatoesScore: varchar("rottenTomatoesScore", { length: 10 }), // e.g., "85%"
  posterUrl: varchar("posterUrl", { length: 500 }),
  posterUrl2: varchar("posterUrl2", { length: 500 }), // second image
  directors: text("directors"), // JSON array of director names
  cast: text("cast"), // JSON array of cast members
  runtime: int("runtime"), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Film = typeof films.$inferSelect;
export type InsertFilm = typeof films.$inferInsert;

/**
 * Film streaming availability junction table
 */
export const filmStreaming = mysqlTable("film_streaming", {
  id: int("id").autoincrement().primaryKey(),
  filmId: int("filmId").notNull().references(() => films.id, { onDelete: "cascade" }),
  platformId: int("platformId").notNull().references(() => streamingPlatforms.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }), // direct link to film on platform
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FilmStreaming = typeof filmStreaming.$inferSelect;
export type InsertFilmStreaming = typeof filmStreaming.$inferInsert;

/**
 * Reviews table for storing 3 reviews per film
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  filmId: int("filmId").notNull().references(() => films.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 100 }), // e.g., "IMDb", "Rotten Tomatoes", "Critic"
  author: varchar("author", { length: 255 }),
  rating: varchar("rating", { length: 10 }), // e.g., "8/10" or "★★★★★"
  text: text("text"), // review content
  url: varchar("url", { length: 500 }), // link to full review
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Film submissions from users
 */
export const filmSubmissions = mysqlTable("film_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  filmTitle: varchar("filmTitle", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "duplicate"]).default("pending").notNull(),
  notes: text("notes"), // internal notes from AI processing
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FilmSubmission = typeof filmSubmissions.$inferSelect;
export type InsertFilmSubmission = typeof filmSubmissions.$inferInsert;