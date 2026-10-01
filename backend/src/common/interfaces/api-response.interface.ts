export interface PagingMetadata {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  paging: PagingMetadata;
}
