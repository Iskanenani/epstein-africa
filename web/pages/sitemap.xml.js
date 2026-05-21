import { STORIES } from "../lib/stories";
import { PEOPLE } from "../lib/people";
import {
  BASE,
  getLocalizedPath,
  hasFrenchPerson,
  hasFrenchStaticPage,
  hasFrenchStory,
} from "../lib/i18n";

function generateSitemap() {
  const now = new Date().toISOString().split("T")[0];

  const staticPages = [
    { path: "/", priority: "1.0", locales: ["en", ...(hasFrenchStaticPage("home") ? ["fr"] : [])] },
    { path: "/archive", priority: "0.9", locales: ["en", ...(hasFrenchStaticPage("archive") ? ["fr"] : [])] },
    { path: "/stories", priority: "0.9", locales: ["en", ...(hasFrenchStaticPage("stories") ? ["fr"] : [])] },
    { path: "/people", priority: "0.9", locales: ["en", ...(hasFrenchStaticPage("people") ? ["fr"] : [])] },
    { path: "/graph", priority: "0.7", locales: ["en", ...(hasFrenchStaticPage("graph") ? ["fr"] : [])] },
    { path: "/map", priority: "0.7", locales: ["en", ...(hasFrenchStaticPage("map") ? ["fr"] : [])] },
    { path: "/about", priority: "0.6", locales: ["en", ...(hasFrenchStaticPage("about") ? ["fr"] : [])] },
  ];

  const storyPages = STORIES.flatMap((story) => [
    { path: `/stories/${story.slug}`, priority: "0.8", locales: ["en"] },
    ...(hasFrenchStory(story)
      ? [{ path: `/stories/${story.slug}`, priority: "0.8", locales: ["fr"] }]
      : []),
  ]);

  const personPages = PEOPLE.flatMap((person) => [
    { path: `/people/${person.slug}`, priority: "0.8", locales: ["en"] },
    ...(hasFrenchPerson(person)
      ? [{ path: `/people/${person.slug}`, priority: "0.8", locales: ["fr"] }]
      : []),
  ]);

  const allPages = [...staticPages, ...storyPages, ...personPages].flatMap((page) =>
    page.locales.map((locale) => ({
      path: getLocalizedPath(page.path, locale),
      priority: page.priority,
    }))
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) =>
      `  <url>
    <loc>${BASE}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.write(generateSitemap());
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
