import { useState } from 'react';

type TableStatus = 'Occupied' | 'Available' | 'Reserved';

interface TableData {
  id: string;
  number: string;
  status: TableStatus;
  guests: number;
  details: string;
  icon: string;
}

const mockTables: TableData[] = [
  { id: 'T1', number: '01', status: 'Occupied', guests: 4, details: '45m active', icon: 'person' },
  { id: 'T2', number: '02', status: 'Available', guests: 2, details: 'Ready', icon: 'person' },
  { id: 'T3', number: '03', status: 'Reserved', guests: 0, details: '14:30 - Mr. Henderson', icon: 'schedule' },
  { id: 'T4', number: '04', status: 'Available', guests: 6, details: 'Window View', icon: 'person' },
  { id: 'T5', number: '05', status: 'Occupied', guests: 2, details: '15m active', icon: 'person' },
  { id: 'T6', number: '06', status: 'Available', guests: 4, details: 'Outdoor', icon: 'person' },
];

export default function TableManagement() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const availableCount = mockTables.filter(t => t.status === 'Available').length;
  const occupiedCount = mockTables.filter(t => t.status === 'Occupied').length;
  const reservedCount = mockTables.filter(t => t.status === 'Reserved').length;

  return (
    <div className="pt-24 pb-8 px-gutter min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <section className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Floor Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Live overview of your cafe seating capacity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-high p-1 rounded-xl">
            <button className="px-4 py-2 rounded-lg bg-surface shadow-sm font-label-md text-label-md text-primary">Grid View</button>
            <button className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Floor Plan</button>
          </div>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Table
          </button>
        </div>
      </section>

      {/* Stats Chips */}
      <section className="mb-stack-lg flex flex-wrap gap-4">
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <span className="font-label-md text-label-md text-on-surface">{availableCount} Available</span>
        </div>
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="font-label-md text-label-md text-on-surface">{occupiedCount} Occupied</span>
        </div>
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-tertiary"></div>
          <span className="font-label-md text-label-md text-on-surface">{reservedCount} Reserved</span>
        </div>
      </section>

      {/* Table Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockTables.map(table => {
          let statusColorClasses = '';
          if (table.status === 'Occupied') {
            statusColorClasses = 'bg-primary/10 text-primary';
          } else if (table.status === 'Available') {
            statusColorClasses = 'bg-secondary/10 text-secondary';
          } else {
            statusColorClasses = 'bg-tertiary/10 text-tertiary';
          }

          let badgeClasses = '';
          if (table.status === 'Occupied') {
            badgeClasses = 'bg-primary-fixed text-on-primary-fixed';
          } else if (table.status === 'Available') {
            badgeClasses = 'bg-secondary-fixed text-on-secondary-fixed';
          } else {
            badgeClasses = 'bg-tertiary-fixed text-on-tertiary-fixed';
          }

          return (
            <div key={table.id} className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/20 group hover:shadow-md hover:scale-[0.99] transition-all cursor-pointer flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusColorClasses}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>table_bar</span>
                </div>
                <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wide ${badgeClasses}`}>
                  {table.status}
                </span>
              </div>
              <div className="mb-6 flex-1">
                <h3 className="font-headline-md text-headline-md text-on-surface">Table {table.number}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm">{table.icon}</span> 
                  {table.guests > 0 ? `${table.guests} Guests • ` : ''}{table.details}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTable(table.number)}
                className="w-full py-3 rounded-xl border-[1.5px] border-primary text-primary font-label-md text-label-md hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                Generate QR Code
              </button>
            </div>
          );
        })}

        {/* Add Table Placeholder */}
        <button className="border-2 border-dashed border-outline-variant/40 p-6 rounded-[24px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-surface-container transition-all group active:scale-95 min-h-[220px]">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center">
            <p className="font-label-md text-label-md text-on-surface">Add New Table</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Expand floor capacity</p>
          </div>
        </button>
      </div>

      {/* QR Code Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-[5px]" onClick={() => setSelectedTable(null)}></div>
          <div className="relative bg-surface-container-lowest p-8 rounded-[32px] shadow-2xl max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline-md text-headline-md text-on-surface">Table {selectedTable} QR</h4>
              <button 
                className="material-symbols-outlined p-1 hover:bg-surface-container rounded-full" 
                onClick={() => setSelectedTable(null)}
              >
                close
              </button>
            </div>
            <div className="aspect-square bg-surface-container-low rounded-2xl flex items-center justify-center mb-6 border border-outline-variant/30 overflow-hidden">
              <div className="w-48 h-48 bg-white p-4 shadow-inner flex items-center justify-center relative">
                {/* Representation of QR code */}
                <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full opacity-80">
                  <div className="bg-primary"></div><div className="bg-surface-variant"></div><div className="bg-primary"></div><div className="bg-primary"></div>
                  <div className="bg-surface-variant"></div><div className="bg-primary"></div><div className="bg-surface-variant"></div><div className="bg-primary"></div>
                  <div className="bg-primary"></div><div className="bg-surface-variant"></div><div className="bg-primary"></div><div className="bg-surface-variant"></div>
                  <div className="bg-primary"></div><div className="bg-primary"></div><div className="bg-surface-variant"></div><div className="bg-primary"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-1 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-3xl">local_cafe</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-center text-on-surface-variant mb-6">
              This code directs guests to the digital menu for Table {selectedTable}.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border-[1.5px] border-primary text-primary font-label-md text-label-md hover:bg-primary/5 active:scale-95 transition-all">Print</button>
              <button className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:shadow-lg active:scale-95 transition-all">Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
