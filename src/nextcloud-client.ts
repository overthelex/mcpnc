const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || "http://127.0.0.1:8890";
const NEXTCLOUD_USER = process.env.NEXTCLOUD_USER || "";
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";

function authHeader(): string {
  return "Basic " + Buffer.from(`${NEXTCLOUD_USER}:${NEXTCLOUD_PASSWORD}`).toString("base64");
}

async function request(method: string, path: string, body?: unknown): Promise<unknown> {
  const url = `${NEXTCLOUD_URL}${path}`;
  const headers: Record<string, string> = {
    "OCS-APIRequest": "true",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": authHeader(),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nextcloud API error ${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// ─── Tables API ───

export async function listTables() {
  return request("GET", "/index.php/apps/tables/api/1/tables");
}

export async function getTable(tableId: number) {
  return request("GET", `/index.php/apps/tables/api/1/tables/${tableId}`);
}

export async function createTable(title: string, emoji?: string, template?: string) {
  return request("POST", "/index.php/apps/tables/api/1/tables", { title, emoji, template });
}

export async function deleteTable(tableId: number) {
  return request("DELETE", `/index.php/apps/tables/api/1/tables/${tableId}`);
}

export async function listColumns(tableId: number) {
  return request("GET", `/index.php/apps/tables/api/1/tables/${tableId}/columns`);
}

export async function listRows(tableId: number) {
  return request("GET", `/index.php/apps/tables/api/1/tables/${tableId}/rows/simple`);
}

export async function createRow(tableId: number, data: Array<{ columnId: number; value: string }>) {
  return request("POST", `/index.php/apps/tables/api/1/tables/${tableId}/rows`, { data });
}

export async function updateRow(rowId: number, data: Array<{ columnId: number; value: string }>) {
  return request("PUT", `/index.php/apps/tables/api/1/rows/${rowId}`, { data });
}

export async function deleteRow(rowId: number) {
  return request("DELETE", `/index.php/apps/tables/api/1/rows/${rowId}`);
}

// ─── Deck API ───

const DECK_BASE = "/index.php/apps/deck/api/v1.0";

export async function listBoards() {
  return request("GET", `${DECK_BASE}/boards`);
}

export async function getBoard(boardId: number) {
  return request("GET", `${DECK_BASE}/boards/${boardId}`);
}

export async function createBoard(title: string, color: string) {
  return request("POST", `${DECK_BASE}/boards`, { title, color });
}

export async function deleteBoard(boardId: number) {
  return request("DELETE", `${DECK_BASE}/boards/${boardId}`);
}

export async function listStacks(boardId: number) {
  return request("GET", `${DECK_BASE}/boards/${boardId}/stacks`);
}

export async function createStack(boardId: number, title: string, order: number) {
  return request("POST", `${DECK_BASE}/boards/${boardId}/stacks`, { title, order });
}

export async function deleteStack(boardId: number, stackId: number) {
  return request("DELETE", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}`);
}

export async function getCard(boardId: number, stackId: number, cardId: number) {
  return request("GET", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`);
}

export async function createCard(
  boardId: number,
  stackId: number,
  title: string,
  opts?: { description?: string; duedate?: string; order?: number }
) {
  return request("POST", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards`, {
    title,
    type: "plain",
    order: opts?.order ?? 999,
    description: opts?.description,
    duedate: opts?.duedate,
  });
}

export async function updateCard(
  boardId: number,
  stackId: number,
  cardId: number,
  data: { title?: string; description?: string; duedate?: string; done?: boolean; archived?: boolean; order?: number }
) {
  return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`, {
    type: "plain",
    ...data,
  });
}

export async function deleteCard(boardId: number, stackId: number, cardId: number) {
  return request("DELETE", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`);
}

export async function assignLabel(boardId: number, stackId: number, cardId: number, labelId: number) {
  return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}/assignLabel`, { labelId });
}

export async function assignUser(boardId: number, stackId: number, cardId: number, userId: string) {
  return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}/assignUser`, { userId });
}

export async function moveCard(boardId: number, stackId: number, cardId: number, targetStackId: number, order: number) {
  return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}/reorder`, {
    stackId: targetStackId,
    order,
  });
}
