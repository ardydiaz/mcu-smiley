import { useEffect, useMemo, useState } from 'react';

export function useDataTable(items = [], getSearchText, initialPageSize = 10) {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return items;
    return items.filter(item => getSearchText(item).toLowerCase().includes(search));
  }, [items, query, getSearchText]);

  const total = items.length;
  const filteredTotal = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = filteredItems.slice(startIndex, startIndex + pageSize);
  const showingFrom = filteredTotal ? startIndex + 1 : 0;
  const showingTo = filteredTotal ? Math.min(startIndex + pageSize, filteredTotal) : 0;

  useEffect(() => {
    setPage(1);
  }, [query, pageSize, total]);

  return {
    query,
    setQuery,
    pageSize,
    setPageSize: value => setPageSize(Number(value)),
    page: safePage,
    totalPages,
    total,
    filteredTotal,
    showingFrom,
    showingTo,
    pageItems,
    previousPage: () => setPage(current => Math.max(1, current - 1)),
    nextPage: () => setPage(current => Math.min(totalPages, current + 1)),
  };
}
