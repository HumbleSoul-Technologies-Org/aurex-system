import fs from "fs";
import path from "path";

interface ParsedHeading {
  level: number;
  text: string;
  id: string;
}

function renderMarkdown(content: string) {
  let html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_m, p1) =>
      `<pre class="bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm"><code>${p1.trim()}</code></pre>`,
  );

  // Headings with IDs for TOC
  const headingReplacements: [RegExp, string][] = [
    [
      /^###### (.*)$/gm,
      '<h6 class="text-sm font-semibold text-foreground mt-6 mb-3 scroll-mt-20">$1</h6>',
    ],
    [
      /^##### (.*)$/gm,
      '<h5 class="text-base font-semibold text-foreground mt-6 mb-3 scroll-mt-20">$1</h5>',
    ],
    [
      /^#### (.*)$/gm,
      '<h4 class="text-lg font-bold text-foreground mt-8 mb-4 flex items-center gap-2 scroll-mt-20"><span class="inline-block w-1 h-6 bg-blue-500 rounded-full"></span>$1</h4>',
    ],
    [
      /^### (.*)$/gm,
      '<h3 class="text-xl font-bold text-foreground mt-8 mb-4 flex items-center gap-2 scroll-mt-20"><span class="inline-block w-1.5 h-7 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>$1</h3>',
    ],
    [
      /^## (.*)$/gm,
      '<h2 class="text-2xl font-bold text-foreground mt-10 mb-5 flex items-center gap-3 scroll-mt-20"><span class="inline-block w-2 h-8 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full"></span>$1</h2>',
    ],
    [
      /^# (.*)$/gm,
      '<h1 class="text-3xl font-bold text-foreground mb-6 flex items-center gap-3 scroll-mt-20"><span class="inline-block w-2 h-10 bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500 rounded-full"></span>$1</h1>',
    ],
  ];

  headingReplacements.forEach(([regex, replacement]) => {
    html = html.replace(regex, replacement);
  });

  // Links
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" class="text-primary hover:text-primary/80 hover:underline font-medium">$1</a>',
  );

  // Lists with better styling
  html = html.replace(
    /(^|\n)- (.*)/g,
    (_m, p1, p2) =>
      `${p1}<li class="flex items-start gap-3 text-foreground mb-2"><span class="text-blue-500 font-bold mt-0.5">•</span><span>${p2}</span></li>`,
  );
  html = html.replace(/(<li[^>]*>.*<\/li>)/gs, '<ul class="space-y-0">$1</ul>');

  // Blockquotes (for tips, notes, warnings)
  html = html.replace(/&gt; (.*?)$/gm, (match, content) => {
    const trimmed = content.trim();
    if (trimmed.toLowerCase().startsWith("tip:")) {
      return `<div class="bg-blue-500/10 border-l-4 border-blue-500 p-4 my-4 rounded-r"><div class="flex gap-3"><span class="text-blue-500 text-xl">💡</span><p class="text-blue-600 dark:text-blue-400 font-medium">${trimmed.substring(4).trim()}</p></div></div>`;
    } else if (trimmed.toLowerCase().startsWith("warning:")) {
      return `<div class="bg-amber-500/10 border-l-4 border-amber-500 p-4 my-4 rounded-r"><div class="flex gap-3"><span class="text-amber-500 text-xl">⚠️</span><p class="text-amber-600 dark:text-amber-400 font-medium">${trimmed.substring(8).trim()}</p></div></div>`;
    } else if (trimmed.toLowerCase().startsWith("note:")) {
      return `<div class="bg-slate-500/10 border-l-4 border-slate-400 p-4 my-4 rounded-r"><div class="flex gap-3"><span class="text-muted-foreground text-xl">ℹ️</span><p class="text-muted-foreground font-medium">${trimmed.substring(5).trim()}</p></div></div>`;
    }
    return match;
  });

  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map((blk) => {
      if (
        /^<h\d/.test(blk) ||
        /^<pre>/.test(blk) ||
        /^<ul>/.test(blk) ||
        /^<div class="bg-/.test(blk)
      )
        return blk;
      return `<p class="text-foreground leading-relaxed mb-4">${blk.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

function extractHeadings(html: string): ParsedHeading[] {
  const headings: ParsedHeading[] = [];
  const regex = /<h([2-3]) class="[^"]*scroll-mt-20">.*?>([^<]+)<\/h\1>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<span[^>]*>.*?<\/span>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ level, text, id });
  }

  return headings;
}

export default function AdminHelpPage() {
  const docsPath = path.join(process.cwd(), "docs", "help", "admin.md");
  let content = "";
  try {
    content = fs.readFileSync(docsPath, "utf8");
  } catch (e) {
    content = "# Admin Guide\n\nDocumentation not found.";
  }
  const html = renderMarkdown(content);
  const headings = extractHeadings(html);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <article className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </article>
      </div>

      {/* Table of Contents - Desktop Only */}
      {headings.length > 0 && (
        <aside className="hidden lg:block">
          <div className="sticky top-8 bg-secondary rounded-lg border border-border p-4 h-fit">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              On this page
            </h3>
            <nav className="space-y-1 text-sm">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block truncate transition-all rounded px-2 py-1.5 ${
                    heading.level === 2
                      ? "text-foreground hover:text-primary hover:bg-primary/10 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary-foreground/20 ml-3"
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
