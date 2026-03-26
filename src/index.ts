#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as nc from "./nextcloud-client.js";

const server = new McpServer({
  name: "nextcloud-legal",
  version: "1.0.0",
});

// ─── Tables tools ───

server.tool("tables_list", "List all Nextcloud Tables", {}, async () => {
  const result = await nc.listTables();
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool(
  "tables_get",
  "Get a Nextcloud Table by ID",
  { tableId: z.number().describe("Table ID") },
  async ({ tableId }) => {
    const result = await nc.getTable(tableId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_create",
  "Create a new Nextcloud Table",
  {
    title: z.string().describe("Table title"),
    emoji: z.string().optional().describe("Emoji icon"),
    template: z.string().optional().describe("Template name"),
  },
  async ({ title, emoji, template }) => {
    const result = await nc.createTable(title, emoji, template);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_delete",
  "Delete a Nextcloud Table",
  { tableId: z.number().describe("Table ID") },
  async ({ tableId }) => {
    const result = await nc.deleteTable(tableId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_columns",
  "List columns of a Nextcloud Table",
  { tableId: z.number().describe("Table ID") },
  async ({ tableId }) => {
    const result = await nc.listColumns(tableId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_rows",
  "List rows of a Nextcloud Table (simple format)",
  { tableId: z.number().describe("Table ID") },
  async ({ tableId }) => {
    const result = await nc.listRows(tableId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_row_create",
  "Create a row in a Nextcloud Table",
  {
    tableId: z.number().describe("Table ID"),
    data: z
      .array(z.object({ columnId: z.number(), value: z.string() }))
      .describe("Column values: [{columnId, value}]"),
  },
  async ({ tableId, data }) => {
    const result = await nc.createRow(tableId, data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_row_update",
  "Update a row in a Nextcloud Table",
  {
    rowId: z.number().describe("Row ID"),
    data: z
      .array(z.object({ columnId: z.number(), value: z.string() }))
      .describe("Column values: [{columnId, value}]"),
  },
  async ({ rowId, data }) => {
    const result = await nc.updateRow(rowId, data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "tables_row_delete",
  "Delete a row from a Nextcloud Table",
  { rowId: z.number().describe("Row ID") },
  async ({ rowId }) => {
    const result = await nc.deleteRow(rowId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── Deck tools ───

server.tool("deck_boards_list", "List all Deck boards", {}, async () => {
  const result = await nc.listBoards();
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool(
  "deck_board_get",
  "Get a Deck board with details",
  { boardId: z.number().describe("Board ID") },
  async ({ boardId }) => {
    const result = await nc.getBoard(boardId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_board_create",
  "Create a new Deck board",
  {
    title: z.string().describe("Board title"),
    color: z.string().describe("Board color hex (e.g. '0087C5')"),
  },
  async ({ title, color }) => {
    const result = await nc.createBoard(title, color);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_board_delete",
  "Delete a Deck board",
  { boardId: z.number().describe("Board ID") },
  async ({ boardId }) => {
    const result = await nc.deleteBoard(boardId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_stacks_list",
  "List stacks (columns) of a Deck board, including their cards",
  { boardId: z.number().describe("Board ID") },
  async ({ boardId }) => {
    const result = await nc.listStacks(boardId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_stack_create",
  "Create a stack (column) on a Deck board",
  {
    boardId: z.number().describe("Board ID"),
    title: z.string().describe("Stack title"),
    order: z.number().describe("Stack order"),
  },
  async ({ boardId, title, order }) => {
    const result = await nc.createStack(boardId, title, order);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_stack_delete",
  "Delete a stack from a Deck board",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
  },
  async ({ boardId, stackId }) => {
    const result = await nc.deleteStack(boardId, stackId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_get",
  "Get a Deck card with full details",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
    cardId: z.number().describe("Card ID"),
  },
  async ({ boardId, stackId, cardId }) => {
    const result = await nc.getCard(boardId, stackId, cardId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_create",
  "Create a card in a Deck stack",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
    title: z.string().describe("Card title"),
    description: z.string().optional().describe("Card description (markdown)"),
    duedate: z.string().optional().describe("Due date (ISO 8601)"),
    order: z.number().optional().describe("Card order"),
  },
  async ({ boardId, stackId, title, description, duedate, order }) => {
    const result = await nc.createCard(boardId, stackId, title, { description, duedate, order });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_update",
  "Update a Deck card",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
    cardId: z.number().describe("Card ID"),
    title: z.string().optional().describe("Card title"),
    description: z.string().optional().describe("Card description"),
    duedate: z.string().optional().describe("Due date (ISO 8601)"),
    done: z.boolean().optional().describe("Mark as done"),
    archived: z.boolean().optional().describe("Archive card"),
    order: z.number().optional().describe("Card order"),
  },
  async ({ boardId, stackId, cardId, ...data }) => {
    const result = await nc.updateCard(boardId, stackId, cardId, data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_delete",
  "Delete a Deck card",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
    cardId: z.number().describe("Card ID"),
  },
  async ({ boardId, stackId, cardId }) => {
    const result = await nc.deleteCard(boardId, stackId, cardId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_move",
  "Move/reorder a Deck card to another stack",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Current stack ID"),
    cardId: z.number().describe("Card ID"),
    targetStackId: z.number().describe("Target stack ID"),
    order: z.number().describe("New order position"),
  },
  async ({ boardId, stackId, cardId, targetStackId, order }) => {
    const result = await nc.moveCard(boardId, stackId, cardId, targetStackId, order);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_assign_label",
  "Assign a label to a Deck card",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
    cardId: z.number().describe("Card ID"),
    labelId: z.number().describe("Label ID"),
  },
  async ({ boardId, stackId, cardId, labelId }) => {
    const result = await nc.assignLabel(boardId, stackId, cardId, labelId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "deck_card_assign_user",
  "Assign a user to a Deck card",
  {
    boardId: z.number().describe("Board ID"),
    stackId: z.number().describe("Stack ID"),
    cardId: z.number().describe("Card ID"),
    userId: z.string().describe("User ID to assign"),
  },
  async ({ boardId, stackId, cardId, userId }) => {
    const result = await nc.assignUser(boardId, stackId, cardId, userId);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── Start server ───

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
