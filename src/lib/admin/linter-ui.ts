export class LinterUI {
  static render(results: any[], container: HTMLElement, button: HTMLButtonElement) {
    if (results.length === 0) {
      container.innerHTML = `
        <div class="flex items-center gap-3 p-4 rounded-l border border-emerald-500/20 bg-emerald-500/5">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <p class="text-xs font-bold text-emerald-200">Sistem Pakar: Kondisi Optimal.</p>
        </div>`;
      button.removeAttribute('disabled');
      return;
    }

    let hasCritical = false;
    container.innerHTML = results.map(res => {
      const type = res.level === 'danger' || res.type === 'error' ? 'error' : (res.level || res.type || 'info');
      if (type === 'error') hasCritical = true;

      const colors = {
        info: 'border-blue-500/20 bg-blue-500/5 text-blue-200',
        warning: 'border-amber-500/20 bg-amber-500/5 text-amber-200',
        error: 'border-red-500/20 bg-red-500/5 text-red-200'
      };

      const colorClass = colors[type as keyof typeof colors] || colors.info;
      const engine = res.engine || 'SYSTEM';

      return `
        <div class="rounded-l border p-4 transition-all hover:bg-white/[0.02] ${colorClass}">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-black uppercase tracking-widest opacity-60">${engine}</span>
            <span class="px-2 py-0.5 rounded-l bg-white/10 text-[9px] font-black uppercase tracking-tighter">${type}</span>
          </div>
          <p class="text-[11px] font-bold leading-relaxed">${res.pesan || res.message || 'Peringatan sistem pakar.'}</p>
          ${res.saran || res.recommendation ? `<div class="mt-2 pt-2 border-t border-white/5 text-[10px] italic opacity-80">Saran: ${res.saran || res.recommendation}</div>` : ''}
        </div>`;
    }).join('');

    if (hasCritical) {
      button.setAttribute('disabled', 'true');
      button.title = "Selesaikan masalah kritis sebelum menyimpan.";
    } else {
      button.removeAttribute('disabled');
    }
  }
}
