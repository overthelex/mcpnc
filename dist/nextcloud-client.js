const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || "http://127.0.0.1:8890";
const NEXTCLOUD_USER = process.env.NEXTCLOUD_USER || "";
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";
function authHeader() {
    return "Basic " + Buffer.from(`${NEXTCLOUD_USER}:${NEXTCLOUD_PASSWORD}`).toString("base64");
}
async function request(method, path, body) {
    const url = `${NEXTCLOUD_URL}${path}`;
    const headers = {
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
export async function getTable(tableId) {
    return request("GET", `/index.php/apps/tables/api/1/tables/${tableId}`);
}
export async function createTable(title, emoji, template) {
    return request("POST", "/index.php/apps/tables/api/1/tables", { title, emoji, template });
}
export async function deleteTable(tableId) {
    return request("DELETE", `/index.php/apps/tables/api/1/tables/${tableId}`);
}
export async function listColumns(tableId) {
    return request("GET", `/index.php/apps/tables/api/1/tables/${tableId}/columns`);
}
export async function listRows(tableId) {
    return request("GET", `/index.php/apps/tables/api/1/tables/${tableId}/rows/simple`);
}
export async function createRow(tableId, data) {
    return request("POST", `/index.php/apps/tables/api/1/tables/${tableId}/rows`, { data });
}
export async function updateRow(rowId, data) {
    return request("PUT", `/index.php/apps/tables/api/1/rows/${rowId}`, { data });
}
export async function deleteRow(rowId) {
    return request("DELETE", `/index.php/apps/tables/api/1/rows/${rowId}`);
}
// ─── Deck API ───
const DECK_BASE = "/index.php/apps/deck/api/v1.0";
export async function listBoards() {
    return request("GET", `${DECK_BASE}/boards`);
}
export async function getBoard(boardId) {
    return request("GET", `${DECK_BASE}/boards/${boardId}`);
}
export async function createBoard(title, color) {
    return request("POST", `${DECK_BASE}/boards`, { title, color });
}
export async function deleteBoard(boardId) {
    return request("DELETE", `${DECK_BASE}/boards/${boardId}`);
}
export async function listStacks(boardId) {
    const stacks = (await request("GET", `${DECK_BASE}/boards/${boardId}/stacks`));
    return stacks.map((stack) => ({
        id: stack.id,
        title: stack.title,
        order: stack.order,
        cards: Array.isArray(stack.cards)
            ? stack.cards.map((card) => ({
                id: card.id,
                title: card.title,
                duedate: card.duedate,
                done: card.done,
                archived: card.archived,
                stackId: card.stackId,
                order: card.order,
            }))
            : [],
    }));
}
export async function createStack(boardId, title, order) {
    return request("POST", `${DECK_BASE}/boards/${boardId}/stacks`, { title, order });
}
export async function deleteStack(boardId, stackId) {
    return request("DELETE", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}`);
}
export async function getCard(boardId, stackId, cardId) {
    return request("GET", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`);
}
export async function createCard(boardId, stackId, title, opts) {
    return request("POST", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards`, {
        title,
        type: "plain",
        order: opts?.order ?? 999,
        description: opts?.description,
        duedate: opts?.duedate,
    });
}
export async function updateCard(boardId, stackId, cardId, data) {
    const current = (await request("GET", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`));
    return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`, {
        type: "plain",
        owner: current.owner,
        title: current.title,
        ...data,
    });
}
export async function deleteCard(boardId, stackId, cardId) {
    return request("DELETE", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}`);
}
export async function assignLabel(boardId, stackId, cardId, labelId) {
    return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}/assignLabel`, { labelId });
}
export async function assignUser(boardId, stackId, cardId, userId) {
    return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}/assignUser`, { userId });
}
export async function moveCard(boardId, stackId, cardId, targetStackId, order) {
    return request("PUT", `${DECK_BASE}/boards/${boardId}/stacks/${stackId}/cards/${cardId}/reorder`, {
        stackId: targetStackId,
        order,
    });
}
// ─── CalDAV Calendar API ───
async function davRequest(method, path, body, extraHeaders) {
    const url = `${NEXTCLOUD_URL}${path}`;
    const headers = {
        "Authorization": authHeader(),
        ...extraHeaders,
    };
    const res = await fetch(url, {
        method,
        headers,
        body: body || undefined,
    });
    const text = await res.text();
    if (!res.ok && res.status !== 207) {
        throw new Error(`CalDAV error ${res.status}: ${text}`);
    }
    return { status: res.status, body: text };
}
function extractTag(xml, tag) {
    const patterns = [
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
        new RegExp(`<d:${tag}[^>]*>([\\s\\S]*?)</d:${tag}>`, "i"),
        new RegExp(`<cal:${tag}[^>]*>([\\s\\S]*?)</cal:${tag}>`, "i"),
    ];
    for (const re of patterns) {
        const m = xml.match(re);
        if (m)
            return m[1].trim();
    }
    return "";
}
function extractAllTags(xml, tag) {
    const results = [];
    const patterns = [
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi"),
        new RegExp(`<d:${tag}[^>]*>([\\s\\S]*?)</d:${tag}>`, "gi"),
    ];
    for (const re of patterns) {
        let m;
        while ((m = re.exec(xml)) !== null) {
            results.push(m[1].trim());
        }
        if (results.length > 0)
            break;
    }
    return results;
}
function parseIcsField(ics, field) {
    const re = new RegExp(`^${field}[^:]*:(.*)$`, "mi");
    const m = ics.match(re);
    return m ? m[1].trim() : "";
}
function parseAlarms(ics) {
    const alarms = [];
    const re = /BEGIN:VALARM[\s\S]*?END:VALARM/gi;
    let m;
    while ((m = re.exec(ics)) !== null) {
        alarms.push({
            action: parseIcsField(m[0], "ACTION"),
            trigger: parseIcsField(m[0], "TRIGGER"),
        });
    }
    return alarms;
}
function parseEvent(ics) {
    return {
        uid: parseIcsField(ics, "UID"),
        summary: parseIcsField(ics, "SUMMARY"),
        dtstart: parseIcsField(ics, "DTSTART"),
        dtend: parseIcsField(ics, "DTEND"),
        location: parseIcsField(ics, "LOCATION"),
        description: parseIcsField(ics, "DESCRIPTION"),
        status: parseIcsField(ics, "STATUS"),
        alarms: parseAlarms(ics),
    };
}
function buildIcs(opts) {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Nextcloud MCP//EN",
        "BEGIN:VEVENT",
        `UID:${opts.uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
        `DTSTART:${opts.dtstart}`,
        `DTEND:${opts.dtend}`,
        `SUMMARY:${opts.summary}`,
    ];
    if (opts.description)
        lines.push(`DESCRIPTION:${opts.description}`);
    if (opts.location)
        lines.push(`LOCATION:${opts.location}`);
    if (opts.alarms) {
        for (const alarm of opts.alarms) {
            lines.push("BEGIN:VALARM", `ACTION:${alarm.action ?? "DISPLAY"}`, `DESCRIPTION:${alarm.description ?? "Reminder"}`, `TRIGGER:${alarm.trigger}`, "END:VALARM");
        }
    }
    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.join("\r\n");
}
function randomUid() {
    return `${crypto.randomUUID()}`;
}
export async function listCalendars() {
    const { body } = await davRequest("PROPFIND", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/`, `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname/>
    <d:resourcetype/>
    <cs:getctag/>
  </d:prop>
</d:propfind>`, { "Depth": "1", "Content-Type": "application/xml; charset=utf-8" });
    const responses = extractAllTags(body, "response");
    const calendars = [];
    for (const resp of responses) {
        const href = extractTag(resp, "href");
        const displayName = extractTag(resp, "displayname");
        const resourceType = extractTag(resp, "resourcetype");
        if (resourceType.includes("calendar") && displayName) {
            calendars.push({ name: displayName, href });
        }
    }
    return calendars;
}
export async function listEvents(calendarId, from, to) {
    const timeRange = from && to
        ? `<cal:time-range start="${from}" end="${to}"/>`
        : "";
    const { body } = await davRequest("REPORT", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/${calendarId}/`, `<?xml version="1.0" encoding="UTF-8"?>
<cal:calendar-query xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <cal:calendar-data/>
  </d:prop>
  <cal:filter>
    <cal:comp-filter name="VCALENDAR">
      <cal:comp-filter name="VEVENT">
        ${timeRange}
      </cal:comp-filter>
    </cal:comp-filter>
  </cal:filter>
</cal:calendar-query>`, { "Depth": "1", "Content-Type": "application/xml; charset=utf-8" });
    const responses = extractAllTags(body, "response");
    const events = [];
    for (const resp of responses) {
        const href = extractTag(resp, "href");
        const calData = extractTag(resp, "calendar-data");
        if (calData && calData.includes("VEVENT")) {
            events.push({ href, ...parseEvent(calData) });
        }
    }
    return events;
}
export async function getEvent(calendarId, eventUid) {
    const { body } = await davRequest("GET", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/${calendarId}/${eventUid}.ics`, undefined, { "Accept": "text/calendar" });
    return parseEvent(body);
}
export async function createEvent(calendarId, summary, dtstart, dtend, opts) {
    const uid = randomUid();
    const ics = buildIcs({ uid, summary, dtstart, dtend, ...opts });
    await davRequest("PUT", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/${calendarId}/${uid}.ics`, ics, { "Content-Type": "text/calendar; charset=utf-8" });
    return { uid, summary, dtstart, dtend, ...opts };
}
export async function updateEvent(calendarId, eventUid, data) {
    // Fetch current event first
    const { body: currentIcs } = await davRequest("GET", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/${calendarId}/${eventUid}.ics`, undefined, { "Accept": "text/calendar" });
    const current = parseEvent(currentIcs);
    const currentAlarms = current.alarms;
    const merged = {
        uid: eventUid,
        summary: data.summary ?? current.summary,
        dtstart: data.dtstart ?? current.dtstart,
        dtend: data.dtend ?? current.dtend,
        description: data.description ?? (current.description || undefined),
        location: data.location ?? (current.location || undefined),
        alarms: data.alarms ?? (currentAlarms.length > 0 ? currentAlarms : undefined),
    };
    const ics = buildIcs(merged);
    await davRequest("PUT", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/${calendarId}/${eventUid}.ics`, ics, { "Content-Type": "text/calendar; charset=utf-8" });
    return merged;
}
export async function deleteEvent(calendarId, eventUid) {
    await davRequest("DELETE", `/remote.php/dav/calendars/${NEXTCLOUD_USER}/${calendarId}/${eventUid}.ics`);
    return { deleted: true, uid: eventUid };
}
