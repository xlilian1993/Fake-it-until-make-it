import html2canvas from 'html2canvas';

export async function renderCardToDataUrl(el: HTMLElement): Promise<string> {
  const w = el.scrollWidth;
  const h = el.scrollHeight;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:fixed;top:0;left:0;width:${w}px;height:${h}px;z-index:99999;background:#FDF6EE;border-radius:16px;overflow:hidden;opacity:0.999;`;
  const inner = el.cloneNode(true) as HTMLElement;
  inner.style.background = 'transparent';
  inner.style.width = w + 'px';
  inner.style.height = 'auto';
  inner.style.position = 'static';
  inner.style.flexShrink = '0';
  wrapper.appendChild(inner);
  document.body.appendChild(wrapper);

  await new Promise(r => requestAnimationFrame(r));

  const canvas = await html2canvas(wrapper, {
    scale: 2,
    useCORS: true,
    windowWidth: w,
    windowHeight: wrapper.scrollHeight,
  });

  document.body.removeChild(wrapper);

  return canvas.toDataURL('image/png');
}

export function triggerDownload(dataUrl: string, filename: string): boolean {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}
