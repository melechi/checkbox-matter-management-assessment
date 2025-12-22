import { useState, useCallback } from 'react';
import { useMatters } from './hooks/useMatters';
import { MatterTable } from './components/MatterTable';
import { Pagination } from './components/Pagination';
import { SearchBar } from './components/SearchBar';
import { FIELD_NAMES } from './types/matter';

function App() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortType, setSortType] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1); // Reset to first page on search
  }, []);

  const { data, total, totalPages, loading, error } = useMatters({
    page,
    limit,
    sortBy,
    sortType,
    sortOrder,
    search,
  });

  const handleSort = (column: string) => {

    let _column = column;
    if (column === 'created_at' || column === 'updated_at') {
      setSortBy(column);
      setSortType('date');
      return;
    } else if (column === FIELD_NAMES.RESOLUTION_TIME) {
      setSortBy('resolution_time');
      setSortType('resolution_time');
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      return;
    } else if (column === FIELD_NAMES.SLA) {
      setSortBy('sla');
      setSortType('sla');
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      return;
    }
    if (data.length && data[0].fields) {
      for (const [key, value] of Object.entries(data[0].fields)) {
          if (key === column) {
            _column = value.fieldId;
            setSortBy(value.fieldId);
            setSortType(value.fieldType);
          }
      }
    }
    if (sortBy === _column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder('asc');
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page on limit change
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Matter Management System</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage all legal matters with cycle time tracking and SLA monitoring
            </p>
          </div>

          <div className="mb-4">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search across all fields, cycle times, and SLA..."
            />
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">Error: {error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                <MatterTable
                  matters={data}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  limit={limit}
                  onLimitChange={handleLimitChange}
                  total={total}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

