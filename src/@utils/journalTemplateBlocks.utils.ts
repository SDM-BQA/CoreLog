export type JournalExpenseItem = {
  id: string;
  amount: number;
  note: string;
  category?: string;
};

export type JournalExpenseBlock = {
  id: string;
  type: "expenses";
  title: string;
  items: JournalExpenseItem[];
};

export type JournalTemplateBlock = JournalExpenseBlock | {
  id: string;
  type: string;
  title: string;
  items?: JournalExpenseItem[];
};

const BLOCK_ATTR = "data-journal-template-blocks";
const BLOCK_PATTERN = /<div[^>]*data-journal-template-blocks="([^"]*)"[^>]*><\/div>/g;

export const stripJournalTemplateBlocks = (content: string) =>
  (content || "").replace(BLOCK_PATTERN, "").trim();

export const extractJournalTemplateBlocks = (content: string): JournalTemplateBlock[] => {
  const blocks: JournalTemplateBlock[] = [];
  const matches = (content || "").matchAll(BLOCK_PATTERN);

  for (const match of matches) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      if (Array.isArray(parsed)) blocks.push(...parsed);
    } catch {
      // Ignore malformed legacy payloads and keep journal rendering resilient.
    }
  }

  return blocks;
};

export const serializeJournalTemplateBlocks = (blocks: JournalTemplateBlock[]) => {
  if (!blocks.length) return "";
  const payload = encodeURIComponent(JSON.stringify(blocks));
  return `<div ${BLOCK_ATTR}="${payload}" contenteditable="false" style="display:none"></div>`;
};

export const mergeJournalTemplateBlocks = (content: string, blocks: JournalTemplateBlock[]) =>
  `${stripJournalTemplateBlocks(content)}${serializeJournalTemplateBlocks(blocks)}`;

export const getExpenseBlocks = (blocks: JournalTemplateBlock[]) =>
  blocks.filter((block): block is JournalExpenseBlock => block.type === "expenses");

export const getExpenseTotal = (block: JournalExpenseBlock) =>
  block.items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);

export const resolveJournalTemplateBlocks = (journal: { content?: string; template_blocks?: JournalTemplateBlock[] }) =>
  journal.template_blocks?.length ? journal.template_blocks : extractJournalTemplateBlocks(journal.content || "");
