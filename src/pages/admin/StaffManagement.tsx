import { useState } from 'react';
import Pagination from '../../components/Pagination';

const INITIAL_STAFF = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Quản Lý Cửa Hàng',
    email: 'sarah.j@webcafe.vn',
    shift: '08:00 - 16:00',
    status: 'online',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUsAf6EIwnz7_P0tdZUlLrdAyI72IXFMgdLoWwcuyPTyuRfFUIS7JQ0AeRlrYf5fmK8Vmr0In4wqCS7wUgftLGXH6DRiwA3ZVnLXibaW32l-hD4Z7i5RKCa5ONJmjri2f0FmJc7yblNqGiQKQeYHzq7V4s_fW7VvLOsi1kkaWd8hJSi18gK3aP38UnNl1b22CZ4JPFamre5c_gKmfzxburlcPZB1QRjElaE8PJnDvVk_dBuHV8q8la'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    role: 'Trưởng Ca Pha Chế (Barista)',
    email: 'm.chen@webcafe.vn',
    shift: '07:00 - 15:00',
    status: 'online',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmULqED7hWVlcRTQsI5WoAqay5ozmJ_AAKclDjtz9LoVBDH63xqx8sTFH1kfqNLOh5ndNYjmKygbtka--axV6-CdGzyNLgi8XdDgTxRpiAgW3OLhDr9g0k6k1Q6fJWrgEE00lpWQBCqubWInoyX0ROzJz_5SgvNd3wONksxtj_yfjGeQzwUAsZSPOEauZF27H56VKb_2bSI86J7Fak7nDi1lMzKRGKmkY60iOE7I33oHz8-AG7CAhV'
  },
  {
    id: '3',
    name: 'Aria Smith',
    role: 'Nhân Viên Phục Vụ',
    email: 'a.smith@webcafe.vn',
    shift: 'Đã hết ca',
    status: 'offline',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARkZWA-Qv5-GipQYje6_xpj8WzLIdF-rnvCDMn5xFxs6iFtaVnQoIC1JZ8exTrKCOxp0z4e3RrTjo2eoAjmHHl_wNaC--6Nyf99nXAsUjRLVPRzNGVEqSPixi0EtLTFNLQJJOLBujPXAo51R0DbktG0k4HkYpr7HYaOnuemgR0dcoqXepDpxM9eyb8upxBdN0GqG8BCIdE0maoRraSCfu9ttkrxCQhMw5OtVqMKetLgR-Uvzj30mdc'
  },
  {
    id: '4',
    name: 'James Wilson',
    role: 'Thu Ngân (Cashier)',
    email: 'j.wilson@webcafe.vn',
    shift: '14:00 - 22:00',
    status: 'online',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCclgjnLUGvkTSo0UHX048_EXcHFwX1Gyv4ciD_qyb73bwbgoxR8kwqkHXFqXBJdv_vYCEp2ziwXF0CqF1zjkkpiE_Y6BPrTIbgHS3iqcSHqYDjWxaT91Ya3pbTccFAjMqsBZcB2GoYPUPkqh5-HFftwcT5uqRD5O-2zXadCGaaywQIK0NsDNro-1EtmCPqUjFv1N_R7CRLMOq1MRvQnTaS1FIsL5hS8s2t0S_XeDUJjbj8omuXsr7a'
  },
  {
    id: '5',
    name: 'Nguyễn Văn Long',
    role: 'Barista Chuyên Nghiệp',
    email: 'long.nv@webcafe.vn',
    shift: '07:00 - 15:00',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '6',
    name: 'Trần Thị Mai',
    role: 'Nhân Viên Order POS',
    email: 'mai.tt@webcafe.vn',
    shift: '15:00 - 23:00',
    status: 'offline',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  }
];

export default function StaffManagement() {
  const [staffMembers] = useState(INITIAL_STAFF);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;

  const totalPages = Math.ceil(staffMembers.length / PAGE_SIZE);
  const paginatedStaff = staffMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex-1 pt-24 pb-8 px-gutter md:px-stack-lg overflow-y-auto custom-scrollbar bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Danh Sách Nhân Sự</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Quản lý vai trò, phân quyền và trạng thái làm việc theo ca.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-all active:scale-95 border-[1.5px]">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Phân Quyền
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Thêm Nhân Viên
          </button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-stack-lg">
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2.5 bg-secondary-container/50 text-on-secondary-container rounded-2xl">
              <span className="material-symbols-outlined">groups</span>
            </span>
            <span className="text-on-surface-variant text-[11px] font-bold">+2 trong tháng</span>
          </div>
          <div className="mt-3">
            <p className="text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">Tổng Nhân Sự</p>
            <h3 className="text-2xl font-black text-primary">{staffMembers.length}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-primary/20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-2.5 bg-primary-container/20 text-primary rounded-2xl">
              <span className="material-symbols-outlined">timer</span>
            </span>
            <span className="text-green-700 text-[11px] font-bold">Đang hoạt động</span>
          </div>
          <div className="mt-3">
            <p className="text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">Trong Ca Làm</p>
            <h3 className="text-2xl font-black text-primary">{staffMembers.filter(s => s.status === 'online').length}</h3>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-outline-variant/30 sm:col-span-2 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-primary text-base">Độ Phủ Ca Làm Việc</h4>
            <p className="text-on-surface-variant text-xs mt-1">Ca sáng đạt 100% công suất. Ca chiều cần thêm 1 nhân viên pha chế.</p>
          </div>
          <span className="text-2xl font-black text-primary bg-primary/10 px-3.5 py-2 rounded-2xl shrink-0">
            92%
          </span>
        </div>
      </section>

      {/* Staff Cards List with Pagination */}
      <section className="space-y-3 mb-6">
        {paginatedStaff.map(staff => (
          <div 
            key={staff.id} 
            className={`bg-surface-container-lowest p-4 rounded-3xl shadow-xs border transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              staff.status === 'online' ? 'border-outline-variant/30' : 'border-outline-variant/15 opacity-75'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img className="w-14 h-14 rounded-2xl object-cover" src={staff.avatar} alt={staff.name} />
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                  <div className={`w-3 h-3 rounded-full ${staff.status === 'online' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-on-surface">{staff.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px]">
                    {staff.role}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-on-surface-variant text-xs">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">mail</span>
                    {staff.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {staff.shift}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button className="px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface transition-colors">
                Lịch Làm Việc
              </button>
              <button className="w-9 h-9 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Pagination Footer */}
      <div className="bg-white rounded-2xl p-2 border border-outline-variant/15 shadow-2xs">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
          totalItems={staffMembers.length}
          pageSize={PAGE_SIZE}
          itemName="nhân viên"
        />
      </div>
    </div>
  );
}
