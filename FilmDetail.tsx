import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";

export default function FilmDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const filmId = parseInt(id || "0");

  const { data: film, isLoading } = trpc.films.detail.useQuery({ id: filmId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <Button onClick={() => navigate("/")} variant="ghost" className="gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Films
          </Button>
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Film not found</p>
          </div>
        </div>
      </div>
    );
  }

  const directors = film.directors ? JSON.parse(film.directors) : [];
  const cast = film.cast ? JSON.parse(film.cast) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate("/")} variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Films
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster Images */}
          <div className="space-y-4">
            {film.posterUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <img src={film.posterUrl} alt={film.title} className="w-full h-auto" />
              </div>
            )}
            {film.posterUrl2 && (
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <img src={film.posterUrl2} alt={`${film.title} - Image 2`} className="w-full h-auto" />
              </div>
            )}
          </div>

          {/* Film Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{film.title}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-slate-700 text-white text-lg px-3 py-1">{film.year}</Badge>
                {film.imdbRating && (
                  <Badge className="bg-yellow-900/50 text-yellow-200 text-lg px-3 py-1">
                    ★ {film.imdbRating}
                  </Badge>
                )}
                {film.rottenTomatoesScore && (
                  <Badge className="bg-red-900/50 text-red-200 text-lg px-3 py-1">
                    🍅 {film.rottenTomatoesScore}
                  </Badge>
                )}
              </div>
            </div>

            {/* Synopsis */}
            {film.synopsis && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Synopsis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{film.synopsis}</p>
                </CardContent>
              </Card>
            )}

            {/* Genres */}
            {film.genres && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {film.genres.split(",").map((genre: string) => (
                    <Badge key={genre} variant="outline" className="border-slate-600 text-slate-300">
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Directors */}
            {directors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Directors</h3>
                <p className="text-slate-300">{directors.join(", ")}</p>
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Cast</h3>
                <p className="text-slate-300">{cast.join(", ")}</p>
              </div>
            )}

            {/* Runtime */}
            {film.runtime && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Runtime</h3>
                <p className="text-slate-300">{film.runtime} minutes</p>
              </div>
            )}

            {/* IMDB Link */}
            {film.imdbUrl && (
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 gap-2">
                <a href={film.imdbUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View on IMDb
                </a>
              </Button>
            )}

            {/* Streaming Platforms */}
            {film.platforms && film.platforms.length > 0 && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Streaming On</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {film.platforms.map((p: any) => (
                      <div key={p.platform.id} className="flex items-center justify-between">
                        <span className="text-slate-300">{p.platform.name}</span>
                        {p.url && (
                          <Button asChild size="sm" variant="outline" className="border-slate-600">
                            <a href={p.url} target="_blank" rel="noopener noreferrer">
                              Watch
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {film.reviews && film.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {film.reviews.map((review: any) => (
                <Card key={review.id} className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{review.source}</CardTitle>
                        {review.author && <p className="text-sm text-slate-400 mt-1">{review.author}</p>}
                      </div>
                      {review.rating && (
                        <Badge className="bg-yellow-900/50 text-yellow-200">{review.rating}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm mb-3 line-clamp-4">{review.text}</p>
                    {review.url && (
                      <Button asChild size="sm" variant="outline" className="border-slate-600 w-full">
                        <a href={review.url} target="_blank" rel="noopener noreferrer">
                          Read Full Review
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
