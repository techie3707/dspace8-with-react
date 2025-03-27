export interface Metadata {
    [key: string]: { value: string }[];
}

export interface Community {
    id: string;
    metadata: Metadata;
}

export interface Collection {
    id: string;
    metadata: Metadata;
}

export interface APIResponse<T> {
    _embedded?: {
        communities?: Community[];
        collections?: Collection[];
    };
}
