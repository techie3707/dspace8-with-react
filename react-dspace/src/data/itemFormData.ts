export interface FormField {
    id: number;
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required: boolean;
}

export const formFields: FormField[] = [
    {
        id: 1,
        name: "author",
        label: "Author",
        type: "text",
        required: true,
    },
    {
        id: 2,
        name: "publisher",
        label: "Publisher",
        type: "text",
        required: true,
    },
    {
        id: 3,
        name: "title",
        label: "Title",
        type: "text",
        required: true,
    },
    {
        id: 4,
        name: "subtitle",
        label: "Subtitle",
        type: "text",
        required: false,
    },
    {
        id: 5,
        name: "description",
        label: "Description",
        type: "textarea",
        required: true,
    },
    {
        id: 6,
        name: "dateCreated",
        label: "Date Created",
        type: "date",
        required: true,
    },
];
