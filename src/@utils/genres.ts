export const GENRE_MAP: Record<string, string> = {
  drama: "Drama",
  comedy: "Comedy",
  childrens: "Childrens",
  psychological_drama: "Psychological Drama",
  fiction: "Fiction",
  fantasy: "Fantasy",
  sci_fi: "Sci-Fi",
  thriller: "Thriller",
  literary: "Literary",
  classic: "Classic",
  self_help: "Self-Help",
  non_fiction: "Non-Fiction",
  mystery: "Mystery",
  mythology: "Mythology",
  historical_fiction: "Historical-Fiction",
  suspense: "Suspense",
  horror: "Horror",
  action_and_adventure: "Action & Adventure",
  biography_and_autobiography: "Biography & Autobiography",
  cooking: "Cooking",
  romance: "Romance",
  poetry: "Poetry",
  psychological_thriller: "Psychological-Thriller",
  crime: "Crime",
  young_adult: "Young Adult",
  animation: "Animation",
  documentary: "Documentary",
  war: "War",
  western: "Western"
};

export const get_genre_display = (key: string): string => {
  return GENRE_MAP[key] || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const get_genre_key = (display: string): string => {
  const entry = Object.entries(GENRE_MAP).find(([, val]) => val === display);
  if (entry) return entry[0];
  return display.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
};
