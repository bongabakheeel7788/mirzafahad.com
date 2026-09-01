module.exports = function (eleventyConfig) {
  // Static assets copied as-is
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  // Blog posts by language
  eleventyConfig.addCollection("postsEn", (api) =>
    api.getFilteredByGlob("src/posts/en/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("postsUr", (api) =>
    api.getFilteredByGlob("src/posts/ur/*.md").sort((a, b) => b.date - a.date)
  );

  // Find the same page in the other language (matched by `key`)
  eleventyConfig.addFilter("altUrl", (all, key, lang) => {
    const other = lang === "en" ? "ur" : "en";
    const match = all.find(
      (p) => p.data.key && p.data.key === key && p.data.lang === other
    );
    if (match) return match.url;
    const base = other === "ur" ? "/ur" : "";
    return key && key.startsWith("post-") ? `${base}/blog/` : `${base}/`;
  });

  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));

  // Related posts: same category first, then others (newest first)
  eleventyConfig.addFilter("related", (pool, url, category, limit) => {
    const others = (pool || []).filter((p) => p.url !== url);
    const same = others.filter((p) => p.data.category === category);
    const rest = others.filter((p) => p.data.category !== category);
    return same.concat(rest).slice(0, limit || 3);
  });

  // Date formatting
  eleventyConfig.addFilter("dateDisplay", (d, lang) => {
    const date = new Date(d);
    if (lang === "ur") {
      return new Intl.DateTimeFormat("ur-PK", { year: "numeric", month: "long", day: "numeric" }).format(date);
    }
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long", day: "numeric" }).format(date);
  });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().split("T")[0]);
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // Reading time
  eleventyConfig.addFilter("readingTime", (content) => {
    const words = (content || "").replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
