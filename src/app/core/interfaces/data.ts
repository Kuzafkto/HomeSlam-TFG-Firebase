/**
 * Interface representing pagination details.
 */
export interface Pagination {
    /**
     * The current page number.
     */
    page: number;
    
    /**
     * The number of items per page.
     */
    pageSize: number;

    /**
     * The total number of pages.
     */
    pageCount: number;

    /**
     * The total number of items.
     */
    total: number;
}

/**
 * Interface representing paginated data.
 * 
 * @template T The type of data being paginated.
 */
export interface PaginatedData<T> {
    /**
     * The array of data items.
     */
    data: T[];

    /**
     * The pagination details.
     */
    pagination: Pagination;
}
