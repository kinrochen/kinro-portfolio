const langKeys = ['zh', 'en'];

export function normalizeSearchText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function compactJoin(values) {
  return values.filter(Boolean).join(' ');
}

function localizedText(value, lang, fallback = '') {
  if (value && typeof value === 'object') return value[lang] || value.en || value.zh || fallback;
  return value || fallback;
}

function buildHaystack(fields) {
  return normalizeSearchText(compactJoin(fields));
}

function scoreItem(item, query) {
  if (!query) return 0;
  let score = 0;
  if (item.search.title.startsWith(query)) score += 120;
  if (item.search.title.includes(query)) score += 80;
  if (item.search.meta.includes(query)) score += 48;
  if (item.search.tags.includes(query)) score += 42;
  if (item.search.body.includes(query)) score += 24;
  if (item.kind === 'project') score += 6;
  if (item.kind === 'note') score += 4;
  return score;
}

function makeProjectItem(project) {
  const titleFields = langKeys.map((key) => project[key]?.title);
  const metaFields = langKeys.flatMap((key) => [project[key]?.tagline, project[key]?.meta]);
  const bodyFields = langKeys.map((key) => project[key]?.description);
  const tags = [...(project.categories || []), project.id, project.noteId || ''];

  return {
    id: project.id,
    kind: 'project',
    targetId: project.id,
    title: { zh: project.zh?.title, en: project.en?.title },
    description: { zh: project.zh?.tagline, en: project.en?.tagline },
    eyebrow: { zh: project.zh?.meta, en: project.en?.meta },
    accent: project.accent,
    search: {
      title: buildHaystack(titleFields),
      meta: buildHaystack(metaFields),
      body: buildHaystack(bodyFields),
      tags: buildHaystack(tags),
    },
  };
}

function makeNoteItem(note) {
  const titleFields = langKeys.map((key) => note[key]?.title);
  const metaFields = langKeys.flatMap((key) => [note[key]?.summary, note.date]);
  const bodyFields = langKeys.map((key) => note[key]?.content);

  return {
    id: note.id,
    kind: 'note',
    targetId: note.id,
    title: { zh: note.zh?.title, en: note.en?.title },
    description: { zh: note.zh?.summary, en: note.en?.summary },
    eyebrow: { zh: note.date, en: note.date },
    search: {
      title: buildHaystack(titleFields),
      meta: buildHaystack(metaFields),
      body: buildHaystack(bodyFields),
      tags: buildHaystack([note.id]),
    },
  };
}

function makeSectionItem(item, index) {
  const title = { zh: item.zh?.[0], en: item.en?.[0] };
  const description = { zh: item.zh?.[1], en: item.en?.[1] };
  const id = `process-${index + 1}`;

  return {
    id,
    kind: 'section',
    targetId: 'process',
    title,
    description,
    eyebrow: { zh: '简历', en: 'Resume' },
    search: {
      title: buildHaystack([title.zh, title.en]),
      meta: buildHaystack(['resume', 'profile', 'stack', 'skills', '技术栈', '能力栈']),
      body: buildHaystack([description.zh, description.en]),
      tags: buildHaystack([id, 'process']),
    },
  };
}

export function buildSearchIndex({ projects = [], notes = [], process = [] }) {
  return [
    ...projects.map(makeProjectItem),
    ...notes.map(makeNoteItem),
    ...process.map(makeSectionItem),
  ];
}

export function searchItems(index, query, lang = 'zh', limit = 8) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return index
    .map((item) => ({ item, score: scoreItem(item, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, limit)
    .map(({ item, score }) => ({
      ...item,
      score,
      title: localizedText(item.title, lang, item.id),
      description: localizedText(item.description, lang),
      eyebrow: localizedText(item.eyebrow, lang),
    }));
}
