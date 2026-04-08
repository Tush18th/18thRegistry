import React from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-8">
        You do not have the required permissions to view this page.
      </p>
      <Link href="/">
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          Return to Dashboard
        </button>
      </Link>
    </div>
  );
}
