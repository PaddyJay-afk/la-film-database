import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getFilms, getFilmById, getStreamingPlatforms, createFilmSubmission } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  films: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        year: z.number().optional(),
        genre: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getFilms(input);
      }),
    
    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getFilmById(input.id);
      }),
  }),

  platforms: router({
    list: publicProcedure.query(async () => {
      return getStreamingPlatforms();
    }),
  }),

  submissions: router({
    create: publicProcedure
      .input(z.object({ filmTitle: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        await createFilmSubmission({
          filmTitle: input.filmTitle,
          userId: ctx.user?.id,
          status: "pending",
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
