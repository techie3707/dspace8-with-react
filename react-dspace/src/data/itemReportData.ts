interface ReportField{
id: number,
metaData: string,
header: string,
}

export const itemReportField: ReportField[] = [
    { id: 1,  metaData: "dc.contributor.author", header: "Author" },
    { id: 2,  metaData: "dc.title", header: "Title" },
    { id: 3,  metaData: "dc.date.issued", header: "Date Issued" },
    { id: 4,  metaData: "dc.publisher", header: "Publisher" },
    { id: 5,  metaData: "dc.sectionName", header: "Section Name" },
    { id: 6,  metaData: "dc.fileType", header: "File Type" },
    { id: 7,  metaData: "dc.month", header: "Month" },
    { id: 8,  metaData: "dc.year1", header: "Year 1" },
    { id: 9,  metaData: "dc.year2", header: "Year 2"},
    { id: 10, metaData: "dc.yearRange", header: "Year Range"},
    { id: 11, metaData: "dc.year", header: "Year" },
    { id: 12, metaData: "dc.pages", header: "Pages" },
    { id: 13, metaData: "dc.boxNo", header: "Box No"},
    { id: 14, metaData: "dc.subject", header: "Subject" },
    { id: 15, metaData: "dc.fileNo", header: "File No" },
    { id: 16, metaData: "dc.fileName", header: "File Name" }
];


export interface Metadata {
  [key: string]: string[];
}

export interface Item {
  itemId: string;
  itemName: string;
  metadata: Metadata;
}

export interface Collection {
  items: Item[];
}

export interface Community {
  collections: Collection[];
}