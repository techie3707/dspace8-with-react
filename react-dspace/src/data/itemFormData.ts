export interface FormField {
    id: number;
    name: string;
    label: string;
    type: string;
    required: boolean;
}

export const formFields: FormField[] = [
    { id: 1, name: "dc.title", label: "Title", type: "text", required: true },
    { id: 2, name: "dc.doctype", label: "Document Type", type: "select", required: true },
    { id: 3, name: "dc.year", label: "Year", type: "text", required: true },
    { id: 4, name: "dc.author", label: "Author", type: "text", required: true },
    { id: 5, name: "dc.keyword", label: "Keywords", type: "text", required: false },
    { id: 6, name: "dc.publisher", label: "Publisher", type: "text", required: false },
    { id: 7, name: "dc.contenttype", label: "Content Type", type: "select", required: true },
    { id: 8, name: "dc.description", label: "Description", type: "textarea", required: false },
    { id: 9, name: "dc.date.created", label: "Date Created", type: "date", required: false }
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