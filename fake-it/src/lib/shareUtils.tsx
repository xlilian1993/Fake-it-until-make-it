import html2canvas from 'html2canvas';
import type { CBTModule, CBTActionModule } from '@/types';

interface Perspective {
  characterName: string;
  viewpoint: string;
  story: string;
}

function createCard(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:fixed;top:0;left:0;width:340px;z-index:99999;background:#FDF6EE;border-radius:16px;padding:28px 20px;font-family:"Noto Serif SC","Noto Sans SC",serif;color:#3D3226;line-height:1.6;`;
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isWechat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}

async function captureToUrl(el: HTMLElement): Promise<string> {
  await new Promise(r => requestAnimationFrame(r));
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    backgroundColor: '#FDF6EE',
  });
  document.body.removeChild(el);
  // 微信浏览器 data URL 有大小限制，用 Blob URL 替代
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    }, 'image/png');
  });
}

function showImageForSave(imgUrl: string, filename: string): void {
  if (isMobile()) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;user-select:none;-webkit-user-select:none';

    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.cssText = 'max-width:90%;max-height:75%;object-fit:contain;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.4);-webkit-touch-callout:default;pointer-events:auto';

    const hint = document.createElement('p');
    hint.textContent = '长按图片保存到相册';
    hint.style.cssText = 'color:rgba(255,255,255,0.8);font-size:14px;user-select:none;-webkit-user-select:none';

    const close = document.createElement('button');
    close.textContent = '关闭';
    close.style.cssText = 'padding:8px 24px;border-radius:999px;background:rgba(255,255,255,0.2);color:#fff;font-size:14px;border:none;cursor:pointer;user-select:none;-webkit-user-select:none';

    overlay.appendChild(img);
    overlay.appendChild(hint);
    overlay.appendChild(close);

    close.onclick = () => {
      if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl);
      document.body.removeChild(overlay);
    };
    overlay.onclick = (e) => { if (e.target === overlay) (close.onclick as unknown as () => void)(); };

    document.body.appendChild(overlay);
  } else {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imgUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl);
  }
}

export function downloadCBTShare(question: string, characterName: string, modules: CBTModule[]): void {
  const modsHtml = modules.map((mod, i) => {
    const action = mod.index === 5 && 'action' in mod ? (mod as CBTActionModule).action : null;
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
      <p style="font-size:11px;color:rgba(61,50,38,0.35);margin:0 0 12px 0">— Fake it until you make it —</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://xlilian.cn/fake-it" width="60" height="60" style="display:block;margin:0 auto 4px;border-radius:6px" alt="二维码" />
      <p style="font-size:9px;color:rgba(61,50,38,0.25);margin:0">扫码体验</p>
    </div>
  `;

  const el = createCard(html);
  captureToUrl(el).then(url => showImageForSave(url, `fake-it-${characterName}.png`));
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
      <p style="font-size:11px;color:rgba(61,50,38,0.35);margin:0 0 12px 0">— Fake it until you make it —</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://xlilian.cn/fake-it" width="60" height="60" style="display:block;margin:0 auto 4px;border-radius:6px" alt="二维码" />
      <p style="font-size:9px;color:rgba(61,50,38,0.25);margin:0">扫码体验</p>
    </div>
  `;

  const el = createCard(html);
  captureToUrl(el).then(url => showImageForSave(url, 'fake-it-roundtable.png'));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
