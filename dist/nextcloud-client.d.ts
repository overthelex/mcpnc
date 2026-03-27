export declare function listTables(): Promise<unknown>;
export declare function getTable(tableId: number): Promise<unknown>;
export declare function createTable(title: string, emoji?: string, template?: string): Promise<unknown>;
export declare function deleteTable(tableId: number): Promise<unknown>;
export declare function listColumns(tableId: number): Promise<unknown>;
export declare function listRows(tableId: number): Promise<unknown>;
export declare function createRow(tableId: number, data: Array<{
    columnId: number;
    value: string;
}>): Promise<unknown>;
export declare function updateRow(rowId: number, data: Array<{
    columnId: number;
    value: string;
}>): Promise<unknown>;
export declare function deleteRow(rowId: number): Promise<unknown>;
export declare function listBoards(): Promise<unknown>;
export declare function getBoard(boardId: number): Promise<unknown>;
export declare function createBoard(title: string, color: string): Promise<unknown>;
export declare function deleteBoard(boardId: number): Promise<unknown>;
export declare function listStacks(boardId: number): Promise<{
    id: unknown;
    title: unknown;
    order: unknown;
    cards: {
        id: unknown;
        title: unknown;
        duedate: unknown;
        done: unknown;
        archived: unknown;
        stackId: unknown;
        order: unknown;
    }[];
}[]>;
export declare function createStack(boardId: number, title: string, order: number): Promise<unknown>;
export declare function deleteStack(boardId: number, stackId: number): Promise<unknown>;
export declare function getCard(boardId: number, stackId: number, cardId: number): Promise<unknown>;
export declare function createCard(boardId: number, stackId: number, title: string, opts?: {
    description?: string;
    duedate?: string;
    order?: number;
}): Promise<unknown>;
export declare function updateCard(boardId: number, stackId: number, cardId: number, data: {
    title?: string;
    description?: string;
    duedate?: string;
    done?: boolean;
    archived?: boolean;
    order?: number;
}): Promise<unknown>;
export declare function deleteCard(boardId: number, stackId: number, cardId: number): Promise<unknown>;
export declare function assignLabel(boardId: number, stackId: number, cardId: number, labelId: number): Promise<unknown>;
export declare function assignUser(boardId: number, stackId: number, cardId: number, userId: string): Promise<unknown>;
export declare function moveCard(boardId: number, stackId: number, cardId: number, targetStackId: number, order: number): Promise<unknown>;
export declare function listCalendars(): Promise<{
    name: string;
    href: string;
}[]>;
export declare function listEvents(calendarId: string, from?: string, to?: string): Promise<(Record<string, string> & {
    href: string;
})[]>;
export declare function getEvent(calendarId: string, eventUid: string): Promise<Record<string, unknown>>;
export declare function createEvent(calendarId: string, summary: string, dtstart: string, dtend: string, opts?: {
    description?: string;
    location?: string;
    alarms?: Array<{
        action?: string;
        trigger: string;
        description?: string;
    }>;
}): Promise<{
    description?: string;
    location?: string;
    alarms?: Array<{
        action?: string;
        trigger: string;
        description?: string;
    }>;
    uid: string;
    summary: string;
    dtstart: string;
    dtend: string;
}>;
export declare function updateEvent(calendarId: string, eventUid: string, data: {
    summary?: string;
    dtstart?: string;
    dtend?: string;
    description?: string;
    location?: string;
    alarms?: Array<{
        action?: string;
        trigger: string;
        description?: string;
    }>;
}): Promise<{
    uid: string;
    summary: string;
    dtstart: string;
    dtend: string;
    description: string | undefined;
    location: string | undefined;
    alarms: {
        action?: string;
        trigger: string;
        description?: string;
    }[] | {
        action: string;
        trigger: string;
    }[] | undefined;
}>;
export declare function deleteEvent(calendarId: string, eventUid: string): Promise<{
    deleted: boolean;
    uid: string;
}>;
