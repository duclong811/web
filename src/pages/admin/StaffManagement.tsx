export default function StaffManagement() {
  return (
    <div className="flex-1 pt-24 pb-8 px-gutter md:px-stack-lg overflow-y-auto custom-scrollbar bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Staff Directory</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your team roles, permissions, and active status.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-all active:scale-95 border-[1.5px]">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Edit Permissions
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Staff
          </button>
        </div>
      </section>

      {/* Stats Overview - Bento Layout */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-stack-lg">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-secondary-container/50 text-on-secondary-container rounded-2xl">
              <span className="material-symbols-outlined">groups</span>
            </span>
            <span className="text-on-surface-variant text-[12px] font-bold">+2 this month</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Total Staff</p>
            <h3 className="text-headline-md font-headline-md text-primary">24</h3>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-primary/20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-primary-container/20 text-primary rounded-2xl">
              <span className="material-symbols-outlined">timer</span>
            </span>
            <span className="text-on-surface-variant text-[12px] font-bold">Current</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">On Duty</p>
            <h3 className="text-headline-md font-headline-md text-primary">12</h3>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 md:col-span-2 flex items-center gap-6">
          <div className="flex-1">
            <h4 className="font-headline-md text-headline-md text-primary">Daily Coverage</h4>
            <p className="text-on-surface-variant font-body-md text-body-md">Morning shift is at 95% capacity. Afternoon requires 1 more barista.</p>
          </div>
          <div className="w-24 h-24 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" fill="transparent" r="40" stroke="#f2f0f0" strokeWidth="8"></circle>
              <circle cx="48" cy="48" fill="transparent" r="40" stroke="#553722" strokeDasharray="251.2" strokeDashoffset="37.6" strokeWidth="8" className="transition-all duration-1000"></circle>
            </svg>
            <span className="absolute font-bold text-primary">85%</span>
          </div>
        </div>
      </section>

      {/* Staff List Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Staff Card 1 */}
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-all hover:scale-[0.99] cursor-pointer group">
          <div className="relative">
            <img className="w-16 h-16 rounded-2xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUsAf6EIwnz7_P0tdZUlLrdAyI72IXFMgdLoWwcuyPTyuRfFUIS7JQ0AeRlrYf5fmK8Vmr0In4wqCS7wUgftLGXH6DRiwA3ZVnLXibaW32l-hD4Z7i5RKCa5ONJmjri2f0FmJc7yblNqGiQKQeYHzq7V4s_fW7VvLOsi1kkaWd8hJSi18gK3aP38UnNl1b22CZ4JPFamre5c_gKmfzxburlcPZB1QRjElaE8PJnDvVk_dBuHV8q8la" alt="Sarah" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-[0_0_8px_rgba(26,122,26,0.4)]"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-[18px] text-on-surface group-hover:text-primary transition-colors">Sarah Jenkins</h4>
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">Manager</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-on-surface-variant font-body-md text-[14px]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">mail</span> sarah.j@warmbrew.com</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 08:00 - 16:00</span>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        {/* Staff Card 2 */}
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-all hover:scale-[0.99] cursor-pointer group">
          <div className="relative">
            <img className="w-16 h-16 rounded-2xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmULqED7hWVlcRTQsI5WoAqay5ozmJ_AAKclDjtz9LoVBDH63xqx8sTFH1kfqNLOh5ndNYjmKygbtka--axV6-CdGzyNLgi8XdDgTxRpiAgW3OLhDr9g0k6k1Q6fJWrgEE00lpWQBCqubWInoyX0ROzJz_5SgvNd3wONksxtj_yfjGeQzwUAsZSPOEauZF27H56VKb_2bSI86J7Fak7nDi1lMzKRGKmkY60iOE7I33oHz8-AG7CAhV" alt="Marcus" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-[0_0_8px_rgba(26,122,26,0.4)]"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-[18px] text-on-surface group-hover:text-primary transition-colors">Marcus Chen</h4>
              <span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Barista</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-on-surface-variant font-body-md text-[14px]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">mail</span> m.chen@warmbrew.com</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 07:00 - 15:00</span>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        {/* Staff Card 3 */}
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-all hover:scale-[0.99] cursor-pointer group opacity-80">
          <div className="relative">
            <img className="w-16 h-16 rounded-2xl object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARkZWA-Qv5-GipQYje6_xpj8WzLIdF-rnvCDMn5xFxs6iFtaVnQoIC1JZ8exTrKCOxp0z4e3RrTjo2eoAjmHHl_wNaC--6Nyf99nXAsUjRLVPRzNGVEqSPixi0EtLTFNLQJJOLBujPXAo51R0DbktG0k4HkYpr7HYaOnuemgR0dcoqXepDpxM9eyb8upxBdN0GqG8BCIdE0maoRraSCfu9ttkrxCQhMw5OtVqMKetLgR-Uvzj30mdc" alt="Aria" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-[18px] text-on-surface group-hover:text-primary transition-colors">Aria Smith</h4>
              <span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Server</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-on-surface-variant font-body-md text-[14px]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">mail</span> a.smith@warmbrew.com</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Off Duty</span>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        {/* Staff Card 4 */}
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-[0_4px_20px_rgba(85,55,34,0.06)] border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-all hover:scale-[0.99] cursor-pointer group">
          <div className="relative">
            <img className="w-16 h-16 rounded-2xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCclgjnLUGvkTSo0UHX048_EXcHFwX1Gyv4ciD_qyb73bwbgoxR8kwqkHXFqXBJdv_vYCEp2ziwXF0CqF1zjkkpiE_Y6BPrTIbgHS3iqcSHqYDjWxaT91Ya3pbTccFAjMqsBZcB2GoYPUPkqh5-HFftwcT5uqRD5O-2zXadCGaaywQIK0NsDNro-1EtmCPqUjFv1N_R7CRLMOq1MRvQnTaS1FIsL5hS8s2t0S_XeDUJjbj8omuXsr7a" alt="James" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-[0_0_8px_rgba(26,122,26,0.4)]"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-[18px] text-on-surface group-hover:text-primary transition-colors">James Wilson</h4>
              <span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Server</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-on-surface-variant font-body-md text-[14px]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">mail</span> j.wilson@warmbrew.com</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 14:00 - 22:00</span>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </section>
    </div>
  );
}
