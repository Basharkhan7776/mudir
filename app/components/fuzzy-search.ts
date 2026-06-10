export type SearchResultType = 'collection' | 'item' | 'organization' | 'ledger';

export interface SearchResult {
  item: Record<string, unknown>;
  score: number;
  type: SearchResultType;
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function calculateScore(query: string, target: string): number {
  if (!query || !target) return 0;

  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);

  if (!normalizedQuery || !normalizedTarget) return 0;

  if (normalizedQuery === normalizedTarget) return 100;
  if (normalizedTarget.startsWith(normalizedQuery)) return 80;
  if (normalizedTarget.includes(normalizedQuery)) return 60;

  const queryWords = normalizedQuery.split('');
  const targetChars = normalizedTarget.split('');
  let queryIndex = 0;
  let matchedChars = 0;

  for (let i = 0; i < targetChars.length && queryIndex < queryWords.length; i++) {
    if (targetChars[i] === queryWords[queryIndex]) {
      matchedChars++;
      queryIndex++;
    }
  }

  if (queryIndex === queryWords.length) {
    const matchRatio = matchedChars / queryWords.length;
    return Math.round(30 * matchRatio);
  }

  const wordsInTarget = normalizedTarget.split(/(?=[A-Z])/g).filter((w) => w.length > 0);
  const allWordsMatch = queryWords.every((char) =>
    wordsInTarget.some((word) => word.includes(char))
  );
  if (allWordsMatch && queryWords.length > 1) return 25;

  return 0;
}

export interface CollectionSearchResult {
  id: string;
  name: string;
  description?: string;
}

export function searchCollections(
  collections: CollectionSearchResult[],
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const collection of collections) {
    const nameScore = calculateScore(query, collection.name);
    const descScore = collection.description
      ? calculateScore(query, collection.description) * 0.7
      : 0;
    const score = Math.max(nameScore, descScore);

    if (score > 0) {
      results.push({
        item: collection as unknown as Record<string, unknown>,
        score,
        type: 'collection',
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

export interface ItemSearchResult {
  id: string;
  collectionId: string;
  collectionName: string;
  values: Record<string, unknown>;
}

export function searchItems(
  collections: Array<{
    id: string;
    name: string;
    data: Array<{ id: string; values: Record<string, unknown> }>;
    schema: Array<{ key: string; label: string }>;
  }>,
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const collection of collections) {
    for (const item of collection.data) {
      const searchableText = collection.schema
        .map((field) => {
          const value = item.values[field.key];
          return value !== null && value !== undefined ? String(value) : '';
        })
        .join(' ')
        .toLowerCase();

      const collectionNameScore = calculateScore(query, collection.name) * 0.5;
      const itemScore = calculateScore(query, searchableText);
      const score = Math.max(collectionNameScore, itemScore);

      if (score > 0) {
        results.push({
          item: {
            id: item.id,
            collectionId: collection.id,
            collectionName: collection.name,
            values: item.values,
          } as unknown as Record<string, unknown>,
          score,
          type: 'item',
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

export interface OrgSearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export function searchOrganizations(
  organizations: OrgSearchResult[],
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const org of organizations) {
    const nameScore = calculateScore(query, org.name);
    const phoneScore = org.phone ? calculateScore(query, org.phone) * 0.5 : 0;
    const emailScore = org.email ? calculateScore(query, org.email) * 0.5 : 0;
    const score = Math.max(nameScore, phoneScore, emailScore);

    if (score > 0) {
      results.push({
        item: org as unknown as Record<string, unknown>,
        score,
        type: 'organization',
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

export interface LedgerSearchResult {
  organizationId: string;
  organizationName: string;
}

export function searchLedgers(
  ledgerEntries: Array<{
    organization: { id: string; name: string; phone?: string; email?: string };
    transactions: Array<{ remark?: string; amount: number }>;
  }>,
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const entry of ledgerEntries) {
    const orgScore = calculateScore(query, entry.organization.name);

    const transactionText = entry.transactions.map((t) => t.remark || '').join(' ');
    const transactionScore = calculateScore(query, transactionText) * 0.6;

    const score = Math.max(orgScore, transactionScore);

    if (score > 0) {
      results.push({
        item: {
          organizationId: entry.organization.id,
          organizationName: entry.organization.name,
        } as unknown as Record<string, unknown>,
        score,
        type: 'ledger',
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}
