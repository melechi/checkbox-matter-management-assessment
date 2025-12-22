import { Matter, CurrencyValue, FIELD_NAMES } from '../types/matter';
import {
  formatCurrency,
  formatDate,
  formatBoolean,
  getStatusBadgeColor,
  getSLABadgeColor
} from '../utils/formatting';

interface MatterTableProps {
  matters: Matter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}



export function MatterTable({ matters, sortBy, sortOrder, onSort }: MatterTableProps) {
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const renderFieldValue = (matter: Matter, fieldName: string) => {
    const field = matter.fields[fieldName];
    if (!field) return <span className="text-gray-400">N/A</span>;

    switch (field.fieldType) {
      case 'currency':
        return <span className="font-medium">{formatCurrency(field.value as CurrencyValue | null)}</span>;
      
      case 'date':
        return <span>{formatDate(field.value as string | null)}</span>;
      
      case 'boolean':
        return (
          <span className={field.value ? 'text-green-600' : 'text-gray-400'}>
            {formatBoolean(field.value as boolean | null)}
          </span>
        );
      
      case 'status':
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
              field.displayValue || ''
            )}`}
          >
            {field.displayValue}
          </span>
        );
      case 'user':
        return <span>{field.displayValue}</span>;
      
      default:
        return <span>{field.displayValue || String(field.value) || 'N/A'}</span>;
    }
  };

  const renderCycleTime = (matter:Matter) => {
    return matter.cycleTime?.resolutionTimeFormatted || 'Unknown';
  }

  const renderSLA = (matter:Matter) => {
    const sla = matter.sla || 'Unknown';
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${getSLABadgeColor(sla)}`}
      >
        {sla}
      </span>
    );
  }

  if (matters.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No matters found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => onSort(FIELD_NAMES.SUBJECT)}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-1">
                {FIELD_NAMES.SUBJECT}
                {renderSortIcon(FIELD_NAMES.SUBJECT)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.CASE_NUMBER)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.CASE_NUMBER}
                {renderSortIcon(FIELD_NAMES.CASE_NUMBER)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.STATUS)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.STATUS}
                {renderSortIcon(FIELD_NAMES.STATUS)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.ASSIGNED_TO)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.ASSIGNED_TO}
                {renderSortIcon(FIELD_NAMES.ASSIGNED_TO)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.PRIORITY)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.PRIORITY}
                {renderSortIcon(FIELD_NAMES.PRIORITY)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.CONTRACT_VALUE)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.CONTRACT_VALUE}
                {renderSortIcon(FIELD_NAMES.CONTRACT_VALUE)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.DUE_DATE)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.DUE_DATE}
                {renderSortIcon(FIELD_NAMES.DUE_DATE)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.URGENT)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.URGENT}
                {renderSortIcon(FIELD_NAMES.URGENT)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.RESOLUTION_TIME)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.RESOLUTION_TIME}
                {renderSortIcon(FIELD_NAMES.RESOLUTION_TIME)}
              </div>
            </th>
            <th onClick={() => onSort(FIELD_NAMES.SLA)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-1">
                {FIELD_NAMES.SLA}
                {renderSortIcon(FIELD_NAMES.SLA)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {matters.map((matter) => (
            <tr key={matter.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {renderFieldValue(matter, FIELD_NAMES.SUBJECT)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {renderFieldValue(matter, FIELD_NAMES.CASE_NUMBER)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderFieldValue(matter, FIELD_NAMES.STATUS)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {renderFieldValue(matter, FIELD_NAMES.ASSIGNED_TO)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {renderFieldValue(matter, FIELD_NAMES.PRIORITY)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {renderFieldValue(matter, FIELD_NAMES.CONTRACT_VALUE)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {renderFieldValue(matter, FIELD_NAMES.DUE_DATE)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {renderFieldValue(matter, FIELD_NAMES.URGENT)}
              </td>
              {/* The following are not "Fields" but are returned by the API and need formatting for display. */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {renderCycleTime(matter)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderSLA(matter)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

