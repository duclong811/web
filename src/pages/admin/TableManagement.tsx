import { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import QRCode from 'qrcode'; // TODO: Run 'npm install qrcode @types/qrcode' first
import { useAuthStore } from '../../store/authStore';

type TableStatus = 'Available' | 'Occupied' | 'Reserved';

interface TableData {
  tableId: number;
  storeId: number;
  tableNumber: string;
  capacity: number;
  qrToken?: string;
  status: TableStatus;
  qrCodeUrl?: string;
}

export default function TableManagement() {
  const storeId = useAuthStore(state => state.user?.storeId);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    tableNumber: '',
        capacity: 2,
  });

  useEffect(() => {
    if (storeId) loadTables();
  }, [storeId]);

  const loadTables = async () => {
    if (!storeId) {
      setError('Vui lòng chọn cửa hàng trước khi quản lý bàn.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/tables/store/${storeId}`);
      setTables(res.data.data || []);
    } catch (err: any) {
      console.error('Load tables failed:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    try {
      setError('');
      await apiClient.post('/tables', {
        storeId,
        tableNumber: formData.tableNumber,
        capacity: formData.capacity,
        status: 'Available',
      });
      setShowAddModal(false);
      loadTables();
      setFormData({ tableNumber: '', capacity: 2 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thêm bàn thất bại');
    }
  };

  const handleUpdateStatus = async (tableId: number, newStatus: TableStatus) => {
    try {
      setError('');
      await apiClient.put(`/tables/${tableId}/status`, { status: newStatus });
      loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bàn này?')) return;
    
    try {
      setError('');
      await apiClient.delete(`/tables/${tableId}`);
      loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xóa bàn thất bại');
    }
  };

  const handleRegenerateQr = async (tableId: number) => {
    if (!confirm('Mã QR cũ sẽ không còn sử dụng được. Bạn có muốn tạo mã mới không?')) return;
    try {
      setError('');
      await apiClient.post(`/tables/${tableId}/qr/regenerate`);
      await loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tạo lại mã QR thất bại');
    }
  };

  const generateQRCode = async (table: TableData) => {
    try {
      const menuUrl = table.qrToken
        ? `${window.location.origin}/qr/${table.qrToken}`
        : `${window.location.origin}/table/${table.storeId}/${table.tableId}`;
      
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setQrCodeDataUrl(qrDataUrl);
      setSelectedTable(table);
      setShowQRModal(true);
    } catch (err) {
      console.error('Generate QR failed:', err);
      setError('Không thể tạo mã QR');
    }
  };

  const downloadQRCode = () => {
    if (!selectedTable) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `Table-${selectedTable.tableNumber}-QR.png`;
    link.click();
  };

  const availableCount = tables.filter(t => t.status === 'Available').length;
  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;
  const reservedCount = tables.filter(t => t.status === 'Reserved').length;

  if (loading) {
    return (
      <div className="pt-24 pb-12 px-gutter">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-on-surface-variant">Đang tải danh sách bàn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-8 px-gutter min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <section className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Quản Lý Bàn</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Quản lý {tables.length} bàn trong quán
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Bàn
        </button>
      </section>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Stats Chips */}
      <section className="mb-stack-lg flex flex-wrap gap-4">
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <span className="font-label-md text-label-md text-on-surface">{availableCount} Trống</span>
        </div>
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="font-label-md text-label-md text-on-surface">{occupiedCount} Đang Dùng</span>
        </div>
        <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-tertiary"></div>
          <span className="font-label-md text-label-md text-on-surface">{reservedCount} Đã Đặt</span>
        </div>
      </section>

      {/* Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => {
          let statusColorClasses = '';
          let badgeClasses = '';
          let statusText = '';
          
          if (table.status === 'Occupied') {
            statusColorClasses = 'bg-primary/10 text-primary';
            badgeClasses = 'bg-primary-fixed text-on-primary-fixed';
            statusText = 'Đang Dùng';
          } else if (table.status === 'Available') {
            statusColorClasses = 'bg-secondary/10 text-secondary';
            badgeClasses = 'bg-secondary-fixed text-on-secondary-fixed';
            statusText = 'Trống';
          } else {
            statusColorClasses = 'bg-tertiary/10 text-tertiary';
            badgeClasses = 'bg-tertiary-fixed text-on-tertiary-fixed';
            statusText = 'Đã Đặt';
          }

          return (
            <div key={table.tableId} className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/20 group hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusColorClasses}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>table_bar</span>
                </div>
                <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wide ${badgeClasses}`}>
                  {statusText}
                </span>
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="font-headline-md text-headline-md text-on-surface">Bàn {table.tableNumber}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm">person</span> 
                  {table.capacity} chỗ ngồi
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => generateQRCode(table)}
                  className="flex-1 bg-surface-container-high hover:bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-sm transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">qr_code</span>
                  QR
                </button>
                <button
                  onClick={() => handleRegenerateQr(table.tableId)}
                  className="px-3 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors"
                  title="Tạo lại mã QR"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
                
                <select
                  value={table.status}
                  onChange={(e) => handleUpdateStatus(table.tableId, e.target.value as TableStatus)}
                  className="flex-1 bg-surface-container-high hover:bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-sm transition-colors"
                >
                  <option value="Available">Trống</option>
                  <option value="Occupied">Đang Dùng</option>
                  <option value="Reserved">Đã Đặt</option>
                </select>

                <button
                  onClick={() => handleDeleteTable(table.tableId)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {tables.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-on-surface-variant">Chưa có bàn nào. Hãy thêm bàn mới!</p>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Thêm Bàn Mới</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số bàn *</label>
                <input
                  type="text"
                  required
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="01, 02, A1, B2..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ ngồi *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-container transition-colors"
                >
                  Thêm Bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Table {selectedTable.tableNumber} QR</h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 p-6 rounded-2xl mb-4">
                <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto w-64 h-64" />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Quét mã này để truy cập thực đơn Bàn {selectedTable.tableNumber}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Tải Xuống
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
