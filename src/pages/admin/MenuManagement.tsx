import { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import Pagination from '../../components/Pagination';

interface Category {
  categoryId: number;
  name: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

interface MenuItem {
  menuItemId: number;
  tenantId: number;
  categoryId: number;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  rating: number;
  isFeatured: boolean;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState('');
  
  const PAGE_SIZE = 8;

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    categoryId: 0,
    imageUrl: '',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [itemsRes, catsRes] = await Promise.all([
        apiClient.get('/menu/items'),
        apiClient.get('/menu/categories'),
      ]);

      setMenuItems(itemsRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch (err: any) {
      console.error('Load menu failed:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu thực đơn');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.categoryId === activeCategory)
    : menuItems;

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await apiClient.post('/menu/items', formData);
      setShowAddModal(false);
      loadData();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thêm món thất bại');
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      setError('');
      await apiClient.put(`/menu/items/${editingItem.menuItemId}`, formData);
      setShowEditModal(false);
      setEditingItem(null);
      loadData();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật món thất bại');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc muốn xóa món này?')) return;
    
    try {
      setError('');
      await apiClient.delete(`/menu/items/${itemId}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xóa món thất bại');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await apiClient.post('/menu/categories', categoryForm);
      setShowCategoryModal(false);
      loadData();
      setCategoryForm({ name: '', icon: '', sortOrder: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thêm danh mục thất bại');
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      basePrice: item.basePrice,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      categoryId: 0,
      imageUrl: '',
      isAvailable: true,
      isFeatured: false,
      sortOrder: 0,
    });
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 px-gutter">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-on-surface-variant">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-gutter animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-stack-lg gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Quản Lý Thực Đơn</h2>
            <p className="text-on-surface-variant font-body-md">
              Quản lý {menuItems.length} món ăn trong {categories.length} danh mục
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center justify-center gap-2 bg-surface-container text-primary px-6 py-3 rounded-full font-label-md shadow-md hover:bg-surface-container-high transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">category</span>
              Danh Mục
            </button>
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-label-md shadow-md hover:bg-primary-container transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Thêm Món Mới
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-stack-md pb-2">
          <button 
            onClick={() => {
              setActiveCategory(null);
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap transition-colors ${
              activeCategory === null
                ? 'bg-secondary-container text-on-secondary-container border border-primary/20 font-bold' 
                : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'
            }`}
          >
            Tất Cả ({menuItems.length})
          </button>
          {categories.map(cat => (
            <button 
              key={cat.categoryId}
              onClick={() => {
                setActiveCategory(cat.categoryId);
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap transition-colors ${
                activeCategory === cat.categoryId
                  ? 'bg-secondary-container text-on-secondary-container border border-primary/20 font-bold' 
                  : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name} ({menuItems.filter(i => i.categoryId === cat.categoryId).length})
            </button>
          ))}
        </div>

        {/* Menu Table */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Món</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Danh Mục</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Giá</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Trạng Thái</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                      Chưa có món nào. Hãy thêm món mới!
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(item => {
                    const category = categories.find(c => c.categoryId === item.categoryId);
                    
                    return (
                      <tr key={item.menuItemId} className="hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              className="w-12 h-12 rounded-xl object-cover" 
                              src={item.imageUrl || 'https://via.placeholder.com/100'} 
                              alt={item.name} 
                            />
                            <div>
                              <p className="font-label-md text-on-surface font-bold">{item.name}</p>
                              <p className="text-xs text-on-surface-variant line-clamp-1">
                                {item.description || 'Không có mô tả'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-secondary-container/40 text-secondary text-xs font-semibold">
                            {category?.name || 'Chưa phân loại'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-label-md text-primary font-bold">
                          {item.basePrice.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.isAvailable 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.isAvailable ? 'Đang Bán' : 'Hết Hàng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all text-xs font-bold active:scale-95 mr-2"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.menuItemId)}
                            className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all text-xs font-bold active:scale-95"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/20">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                totalItems={filteredItems.length}
                pageSize={PAGE_SIZE}
                itemName="món"
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Thêm Món Mới</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên món *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Cà phê sữa đá"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Mô tả về món ăn"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="35000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={0}>Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Đang bán</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Món nổi bật</span>
                </label>
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
                  Thêm Món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Sửa Món</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên món *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Đang bán</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Món nổi bật</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-container transition-colors"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Thêm Danh Mục</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Cà phê"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="☕"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự sắp xếp</label>
                <input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-container transition-colors"
                >
                  Thêm Danh Mục
                </button>
              </div>
            </form>

            {/* Existing Categories */}
            {categories.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-3">Danh mục hiện tại:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(cat => (
                    <div key={cat.categoryId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">
                        {cat.icon} {cat.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
