export interface FormField {
    id: number;
    name: string;
    label: string;
    type: string;
    required: boolean;
}
export const formFields: FormField[] = [
    { id: 1, name: "dc.contributor.author", label: "Author", type: "text", required: true },
    { id: 2, name: "dc.publisher", label: "Publisher", type: "text", required: true },
    { id: 3, name: "dc.title", label: "Title", type: "text", required: true },
    { id: 4, name: "dc.date.created", label: "Date Created", type: "date", required: true },
    { id: 5, name: "dc.description", label: "Description", type: "textarea", required: true },
];

