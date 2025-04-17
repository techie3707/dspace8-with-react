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
    // { id: 5, name: "dc.description", label: "Description", type: "textarea", required: true },
];

export interface PatchOperation {
    op: 'add' | 'remove' | 'replace' ;
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