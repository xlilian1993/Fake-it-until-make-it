import html2canvas from 'html2canvas';
import type { CBTModule } from '@/types';

interface Perspective {
  characterName: string;
  viewpoint: string;
  story: string;
}

function createCard(html: string, className?: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:fixed;top:0;left:0;width:340px;z-index:99999;background:#FDF6EE;border-radius:16px;padding:28px 20px;font-family:"Noto Serif SC","Noto Sans SC",serif;color:#3D3226;line-height:1.6;`;
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function captureAndDownload(el: HTMLElement, filename: string): Promise<void> {
  await new Promise(r => requestAnimationFrame(r));
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    backgroundColor: '#FDF6EE',
  });
  document.body.removeChild(el);

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCBTShare(question: string, characterName: string, modules: CBTModule[]): void {
  const modsHtml = modules.map((mod, i) => {
    const action = mod.index === 5 && 'action' in mod && (mod as any).action;
    return `
      <div style="margin-bottom:${i === modules.length - 1 ? '0' : '12px'}">
        <p style="font-size:11px;color:rgba(61,50,38,0.35);margin:0 0 4px 4px">${escapeHtml(mod.title)}</p>
        <div style="background:#fff;border-radius:14px 14px 14px 4px;padding:10px 14px">
          <p style="font-size:13px;margin:0;line-height:1.6;white-space:pre-wrap">${escapeHtml(mod.content)}</p>
        </div>
        ${action ? `
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
            ${[
              { emoji: '🎬', label: '今天的排练', text: action.firstStep },
              { emoji: '🎭', label: '新台词', text: action.emergencyScript },
              { emoji: '🪄', label: '进阶剧本', text: action.backupPlan },
            ].map(item => `
              <div style="background:#fff;border:1px solid rgba(184,169,255,0.2);border-radius:10px;padding:10px 12px">
                <p style="font-size:10px;color:rgba(61,50,38,0.4);margin:0 0 4px 0">${item.emoji} ${escapeHtml(item.label)}</p>
                <p style="font-size:12px;margin:0;line-height:1.5">${escapeHtml(item.text)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const html = `
    <div style="text-align:center;margin-bottom:16px">
      <p style="font-size:10px;color:rgba(61,50,38,0.4);margin:0 0 2px 0">Fake It Until You Make It</p>
      <p style="font-size:16px;font-weight:700;margin:0">与 ${escapeHtml(characterName)} 的对话</p>
    </div>
    <div style="margin-bottom:16px">
      <p style="font-size:10px;color:rgba(61,50,38,0.35);margin:0 0 4px 4px">你的问题</p>
      <div style="background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:10px 14px">
        <p style="font-size:13px;margin:0;line-height:1.6">${escapeHtml(question)}</p>
      </div>
    </div>
    <div>
      <p style="font-size:10px;color:rgba(61,50,38,0.35);margin:0 0 8px 4px">${escapeHtml(characterName)} 的回应</p>
      ${modsHtml}
    </div>
    <div style="text-align:center;margin-top:20px;padding-top:14px;border-top:1px solid rgba(0,0,0,0.06)">
      <p style="font-size:11px;color:rgba(61,50,38,0.35);margin:0">— Fake it until you make it —</p>
    </div>
  `;

  const el = createCard(html);
  captureAndDownload(el, `fake-it-${characterName}.png`);
}

export function downloadRoundTableShare(question: string, perspectives: Perspective[]): void {
  const perspHtml = perspectives.map((p, i) => `
    <div style="margin-bottom:${i === perspectives.length - 1 ? '0' : '16px'}">
      <p style="font-size:11px;color:rgba(61,50,38,0.35);margin:0 0 6px 4px">${escapeHtml(p.characterName)}的观点</p>
      <div style="background:#fff;border-radius:14px 14px 14px 4px;padding:10px 14px;margin-bottom:8px">
        <p style="font-size:10px;color:rgba(61,50,38,0.4);margin:0 0 4px 0">💡 观点</p>
        <p style="font-size:13px;margin:0;line-height:1.6">${escapeHtml(p.viewpoint)}</p>
      </div>
      <div style="background:#fff;border-radius:14px 14px 14px 4px;padding:10px 14px">
        <p style="font-size:10px;color:rgba(61,50,38,0.4);margin:0 0 4px 0">📖 经历</p>
        <p style="font-size:13px;margin:0;line-height:1.6">${escapeHtml(p.story)}</p>
      </div>
    </div>
  `).join('');

  const html = `
    <div style="text-align:center;margin-bottom:16px">
      <p style="font-size:10px;color:rgba(61,50,38,0.4);margin:0 0 2px 0">Fake It Until You Make It</p>
      <p style="font-size:16px;font-weight:700;margin:0">圆桌讨论</p>
    </div>
    <div style="margin-bottom:16px">
      <p style="font-size:10px;color:rgba(61,50,38,0.35);margin:0 0 4px 4px">讨论话题</p>
      <div style="background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:10px 14px">
        <p style="font-size:13px;margin:0;line-height:1.6">${escapeHtml(question)}</p>
      </div>
    </div>
    <div>${perspHtml}</div>
    <div style="text-align:center;margin-top:20px;padding-top:14px;border-top:1px solid rgba(0,0,0,0.06)">
      <p style="font-size:11px;color:rgba(61,50,38,0.35);margin:0">— Fake it until you make it —</p>
    </div>
  `;

  const el = createCard(html);
  captureAndDownload(el, 'fake-it-roundtable.png');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
