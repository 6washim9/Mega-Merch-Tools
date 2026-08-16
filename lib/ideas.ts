export interface IdeaParams {
  niches: string[];
  styles: string[];
  seasons: string[];
  themes: string[];
}

export interface MerchIdea {
  title: string;
  description: string;
  whyItWorks: string;
}

export const NICHES = [
  "Funny Sarcasm",
  "Retro Gamer",
  "Dog Lover",
  "Cat Mom",
  "Dad Jokes",
  "Coffee Addict",
  "Vintage Travel",
  "Bodybuilding",
  "Nurse Life",
  "Teacher Humor",
  "Mountain Hiker",
  "Beach Vibes",
  "Hockey Dad",
  "Golf Dad",
  "Camping",
  "Fishing",
  "Astrology",
  "Anime",
  "Music Fan",
  "Bookworm",
  "Mom Life",
  "Wedding",
  "Birthday",
  "Christmas",
  "Halloween",
  "Punny",
  "Motivational",
  "80s Nostalgia",
  "Biker",
  "Foodie",
];

export const STYLES = [
  "Minimalist",
  "Retro Vintage",
  "Hand-drawn",
  "Bold Typography",
  "Watercolor",
  "Neon",
  "Cartoon",
  "Rustic",
  "Geometric",
  "Line Art",
  "Streetwear",
  "Kawaii",
  "Grunge",
  "Floral",
  "Pop Art",
];

export const SEASONS = [
  "Summer",
  "Fall",
  "Winter",
  "Spring",
  "Year-Round",
  "Holiday",
  "Back to School",
  "Summer Vacation",
];

export const THEMES = [
  "Funny Quote",
  "Pun",
  "Inside Joke",
  "Tribute",
  "Hobby",
  "Family",
  "Occupation",
  "Lifestyle",
  "Celebration",
  "Nature",
  "Food & Drink",
  "Sports",
  "Pop Culture",
  "Animal",
  "Travel",
  "Motivation",
  "Horror",
  "Fantasy",
  "Retro",
  "Abstract",
];

type TitleTemplate = (niche: string, style: string, theme: string, season: string) => string;

const TITLE_TEMPLATES: TitleTemplate[] = [
  (niche, style, theme, season) => `${niche} ${theme} ${style} ${season} T-Shirt`,
  (niche, style, theme, season) => `Funny ${theme} ${niche} ${style} Tee`,
  (niche, style, theme, season) => `${style} ${niche} ${theme} ${season} Design`,
];

export function pickRandom<T>(arr: T[], rng: () => number = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateIdeas(
  params: IdeaParams,
  count = 5,
  rng: () => number = Math.random
): MerchIdea[] {
  const used = new Set<string>();
  const ideas: MerchIdea[] = [];
  let guard = 0;
  while (ideas.length < count && guard < 1000) {
    guard++;
    const niche = params.niches.length > 0 ? pickRandom(params.niches, rng) : pickRandom(NICHES, rng);
    const style = params.styles.length > 0 ? pickRandom(params.styles, rng) : pickRandom(STYLES, rng);
    const season = params.seasons.length > 0 ? pickRandom(params.seasons, rng) : pickRandom(SEASONS, rng);
    const theme = params.themes.length > 0 ? pickRandom(params.themes, rng) : pickRandom(THEMES, rng);
    const key = `${niche}|${style}|${season}|${theme}`;
    if (used.has(key)) continue;
    used.add(key);
    const template = pickRandom(TITLE_TEMPLATES, rng);
    ideas.push({
      title: template(niche, style, theme, season),
      description: `A ${style.toLowerCase()} ${theme.toLowerCase()} design for ${niche.toLowerCase()} fans, made for ${season.toLowerCase()} wear.`,
      whyItWorks: `Combines the proven ${niche.toLowerCase()} niche with ${style.toLowerCase()} styling and a ${theme.toLowerCase()} theme — a mix with strong search demand.`,
    });
  }
  return ideas;
}

export function formatIdeasAsText(ideas: MerchIdea[]): string {
  return ideas
    .map((idea, i) => `${i + 1}. ${idea.title}\n   ${idea.description}\n   Why it works: ${idea.whyItWorks}`)
    .join("\n\n");
}
