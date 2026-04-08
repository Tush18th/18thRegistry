import React from 'react';
import { useQuery } from 'react-query';
import api from '../../../lib/api';
import { RequireRole } from '../../../components/auth/RequireRole';
import { UserRole } from '../../../contexts/AuthContext';

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery(['audit-logs'], async () => {
    const res = await api.get('/audit-logs?limit=50');
    return res.data;
  });

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
            <p className="mt-2 text-sm text-gray-700">
              System wide audit trails for permission updates and management.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date/Time</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actor ID</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Target Resource</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Changes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-sm text-gray-500">Loading logs...</td>
                      </tr>
                    ) : (data?.data || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-sm text-gray-500">No logs found</td>
                      </tr>
                    ) : (
                      (data?.data || []).map((log: any) => (
                        <tr key={log.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{log.actorId || 'System'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {log.targetResource} ({log.targetId})
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 break-words max-w-xs">
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
