// What each media kind is called on screen in the builder. The saved value ("Talk") stays the same,
// so older media keeps its kind; the public profile already shows it as "Speaking" (builder-to-profile).
export const MEDIA_LABEL: Record<string, string> = { Talk: "Speaking" };
export const mediaLabel = (k: string) => MEDIA_LABEL[k] ?? k;
