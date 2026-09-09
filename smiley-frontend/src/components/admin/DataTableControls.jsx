import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Button from '../common/Button.jsx';

export function DataTableToolbar({ table, searchPlaceholder = 'Search table...' }) {
  return (
    <div className="data-table-toolbar">
      <label className="search-field data-table-search">
        <Search size={18} aria-hidden="true" />
        <input
          value={table.query}
          onChange={event => table.setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          maxLength={100}
        />
      </label>
      <label className="data-table-page-size">
        <span>Show</span>
        <select value={table.pageSize} onChange={event => table.setPageSize(event.target.value)}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>entries</span>
      </label>
    </div>
  );
}

export function DataTableSummary({ table, itemLabel = 'records' }) {
  const label = table.filteredTotal === 1 ? itemLabel.replace(/s$/, '') : itemLabel;
  return (
    <div className="data-table-summary">
      <span>
        {table.filteredTotal
          ? `Showing ${table.showingFrom.toLocaleString()}-${table.showingTo.toLocaleString()} of ${table.filteredTotal.toLocaleString()} ${label}`
          : `No matching ${itemLabel}`}
      </span>
      {table.query && table.filteredTotal !== table.total ? (
        <span>Filtered from {table.total.toLocaleString()} total</span>
      ) : (
        <span>Page {table.page.toLocaleString()} of {table.totalPages.toLocaleString()}</span>
      )}
    </div>
  );
}

export function DataTablePagination({ table }) {
  return (
    <div className="pagination-bar data-table-pagination">
      <Button type="button" variant="secondary" icon={ChevronLeft} onClick={table.previousPage} disabled={table.page <= 1}>Previous</Button>
      <span>{table.page} / {table.totalPages}</span>
      <Button type="button" variant="secondary" icon={ChevronRight} onClick={table.nextPage} disabled={table.page >= table.totalPages}>Next</Button>
    </div>
  );
}
