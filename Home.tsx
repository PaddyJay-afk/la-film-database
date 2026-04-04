import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Film, Send } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: films, isLoading: filmsLoading } = trpc.films.list.useQuery({
    search: searchQuery || undefined,
    year: selectedYear ? parseInt(selectedYear) : undefined,
    genre: selectedGenre || undefined,
  });

  const submitFilm = trpc.submissions.create.useMutation();

  const handleSubmitFilm = async () => {
    if (!submissionTitle.trim()) {
      toast.error("Please enter a film title");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFilm.mutateAsync({ filmTitle: submissionTitle });
      setSubmissionTitle("");
      toast.success("Film suggestion submitted! We'll review it within 72 hours.");
    } catch (error) {
      toast.error("Failed to submit film suggestion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const years = useMemo(() => {
    if (!films) return [];
    const yearSet = new Set(films.map((f: any) => f.year));
    return Array.from(yearSet).sort((a: any, b: any) => b - a);
  }, [films]);

  const genres = useMemo(() => {
    if (!films) return [];
    const genreSet = new Set<string>();
    films.forEach((f: any) => {
      if (f.genres) {
        f.genres.split(",").forEach((g: string) => genreSet.add(g.trim()));
      }
    });
    return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  }, [films]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gritty Cinema</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Suggest Film</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Suggest a Film</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Know a gritty LA or Vegas film we should add? Submit it below and we'll review it within 72 hours.
                  </p>
                  <Input
                    placeholder="Enter film title..."
                    value={submissionTitle}
                    onChange={(e) => setSubmissionTitle(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                  <Button
                    onClick={handleSubmitFilm}
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              LA & Vegas Noir
              <br />
              <span className="text-red-600">1980–2026</span>
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Explore gritty, atmospheric films set in Los Angeles and Las Vegas. From neo-noir classics to contemporary masterpieces.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-slate-800 bg-slate-950 py-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search films by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-md"
              >
                <option value="">All Years</option>
                {years.map((year: any) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-md"
              >
                <option value="">All Genres</option>
                {genres.map((genre: any) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedYear("");
                  setSelectedGenre("");
                }}
                className="border-slate-700 text-slate-300 hover:bg-slate-900"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Films Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {filmsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : films && films.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No films found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {films?.map((film: any) => (
                <button
                  key={film.id}
                  onClick={() => navigate(`/film/${film.id}`)}
                  className="group text-left transition-transform hover:scale-105"
                >
                  <Card className="bg-slate-900 border-slate-800 overflow-hidden h-full hover:border-red-600 transition-colors">
                    {/* Poster Image */}
                    {film.posterUrl && (
                      <div className="relative w-full aspect-[2/3] bg-slate-800 overflow-hidden">
                        <img
                          src={film.posterUrl}
                          alt={film.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {film.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">{film.year}</span>
                        {film.imdbRating && (
                          <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-200 text-xs">
                            ★ {film.imdbRating}
                          </Badge>
                        )}
                      </div>
                      {film.genres && (
                        <div className="flex flex-wrap gap-1">
                          {film.genres
                            .split(",")
                            .slice(0, 2)
                            .map((genre: string) => (
                              <Badge key={genre} variant="outline" className="text-xs border-slate-700 text-slate-300">
                                {genre.trim()}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Gritty Cinema • Curated collection of LA & Vegas noir films • Updated every 72 hours</p>
        </div>
      </footer>
    </div>
  );
}
