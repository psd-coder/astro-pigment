export type BlockEntry = {
  pageId: string;
  pageTitle: string;
  pageOrder: number;
  /** Page-level summary, repeated on every block so it can boost the whole page. */
  description: string;
  heading: string;
  anchor: string;
  body: string;
};

export type BlockResult = {
  pageId: string;
  heading: string;
  anchor: string;
  snippet: string;
};

export type GroupedSearchResult = {
  pageId: string;
  pageTitle: string;
  blocks: BlockResult[];
};

export type ClientMessages = {
  init: { data: BlockEntry[] };
  search: { query: string };
};

export type WorkerMessages = {
  "search-results": { data: GroupedSearchResult[] };
};
