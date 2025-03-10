'use client';

import { InventoryReport } from '@/components/reports/InventoryReport';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Reportes
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                  <InventoryReport />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 