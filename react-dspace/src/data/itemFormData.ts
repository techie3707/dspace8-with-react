export interface FormField {
    id: number;
    name: string;
    label: string;
    type: string;
    required: boolean;
}

export const formFields: FormField[] = [
    { id: 1, name: "dc.contributor.author", label: "Author", type: "text", required: true },
    { id: 2, name: "dc.title", label: "Title", type: "text", required: true },
    { id: 3, name: "dc.date.issued", label: "Date Issued", type: "date", required: true },
    { id: 4, name: "dc.publisher", label: "Publisher", type: "text", required: true },
    { id: 5, name: "dc.sectionName", label: "Section Name", type: "text", required: false },
    { id: 6, name: "dc.fileType", label: "File Type", type: "text", required: false },
    { id: 7, name: "dc.month", label: "Month", type: "text", required: false },
    { id: 8, name: "dc.year1", label: "Year 1", type: "text", required: false },
    { id: 9, name: "dc.year2", label: "Year 2", type: "text", required: false },
    { id: 10, name: "dc.yearRange", label: "Year Range", type: "text", required: false },
    { id: 11, name: "dc.year", label: "Year", type: "text", required: false },
    { id: 12, name: "dc.pages", label: "Pages", type: "text", required: false },
    { id: 13, name: "dc.boxNo", label: "Box No", type: "text", required: false },
    { id: 14, name: "dc.subject", label: "Subject", type: "text", required: false },
    { id: 15, name: "dc.fileNo", label: "File No", type: "text", required: false },
    { id: 16, name: "dc.fileName", label: "File Name", type: "text", required: false }
];


export interface PatchOperation {
    op: 'add' | 'remove' | 'replace';
    path: string;
    value?: any;
}

export interface ItemInfo {
    id: string;
    uuid: string;
    name: string;
    metadata: {
        [key: string]: { value: string }[];
    };
}

export interface CreateItemProps {
    collectionId: string;
}

export interface workspaceitemresponse {
    id: string;
    _links: {
        self: {
            href: string;
        };
    };
}

export interface Workspaceresponse {
    id: string;
}