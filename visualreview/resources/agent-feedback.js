/**
 * agent-feedback.js — In-App Visual Review & Feedback Tool for Antigravity
 *
 * Drops a floating "💬 Review" widget onto any web application draft.
 * - Toggle Review Mode (or hold Alt + Click)
 * - Hover to inspect elements, Click to drop a feedback pin
 * - Automatically captures CSS selectors, text/image attributes, and your notes
 * - Keeps pins across page reloads (localStorage)
 * - One-click "Copy for Antigravity" or "Save feedback.md"
 */
(function () {
  if (window.__AGENT_FEEDBACK_INITIALIZED__) return;
  window.__AGENT_FEEDBACK_INITIALIZED__ = true;

  const STORAGE_KEY = 'agent_feedback_pins_v1';
  let isReviewMode = false;
  let pins = [];
  let hoveredElement = null;

  // Load existing pins from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) pins = JSON.parse(saved);
  } catch (e) {
    pins = [];
  }

  // Create isolated container with Shadow DOM to prevent CSS leaks
  const host = document.createElement('div');
  host.id = 'agent-feedback-host';
  host.style.position = 'absolute';
  host.style.top = '0';
  host.style.left = '0';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Styles for the widget
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* Floating Bar */
    .af-bar {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #18181b;
      color: #f4f4f5;
      padding: 6px 10px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      user-select: none;
      border: 1px solid #27272a;
      transition: all 0.2s ease;
      z-index: 2147483647;
    }
    .af-btn {
      background: #27272a;
      color: #f4f4f5;
      border: 1px solid #3f3f46;
      border-radius: 9999px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .af-btn:hover { background: #3f3f46; }
    .af-btn.active {
      background: #4f46e5;
      border-color: #6366f1;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
    }
    .af-badge {
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
      display: none;
    }
    .af-badge.visible { display: inline-block; }

    /* Hover Highlight Overlay */
    .af-highlight {
      position: absolute;
      border: 2px dashed #6366f1;
      background: rgba(99, 102, 241, 0.12);
      pointer-events: none;
      transition: all 0.08s ease;
      display: none;
      border-radius: 4px;
      z-index: 2147483640;
    }
    .af-tag-label {
      position: absolute;
      top: -22px;
      left: 0;
      background: #4f46e5;
      color: white;
      font-size: 10px;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
    }

    /* Pin Marker */
    .af-pin {
      position: absolute;
      width: 26px;
      height: 26px;
      background: #ef4444;
      color: white;
      font-size: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 2px white;
      cursor: pointer;
      pointer-events: auto;
      transform: translate(-50%, -50%);
      z-index: 2147483645;
      transition: transform 0.15s ease;
    }
    .af-pin:hover { transform: translate(-50%, -50%) scale(1.15); }

    /* Popover / Comment Dialog */
    .af-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #18181b;
      color: #fafafa;
      border: 1px solid #3f3f46;
      border-radius: 12px;
      padding: 18px;
      width: 440px;
      max-width: 90vw;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.6);
      pointer-events: auto;
      z-index: 2147483647;
      display: none;
    }
    .af-modal.open { display: block; }
    .af-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .af-modal-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .af-close-btn {
      background: transparent;
      border: none;
      color: #a1a1aa;
      font-size: 18px;
      cursor: pointer;
      padding: 2px 6px;
    }
    .af-close-btn:hover { color: #fff; }
    .af-target-info {
      background: #27272a;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11px;
      font-family: monospace;
      color: #cbd5e1;
      margin-bottom: 12px;
      max-height: 80px;
      overflow-y: auto;
      word-break: break-all;
    }
    .af-textarea {
      width: 100%;
      height: 90px;
      background: #09090b;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      color: #fafafa;
      padding: 10px;
      font-size: 13px;
      resize: vertical;
      margin-bottom: 14px;
      outline: none;
    }
    .af-textarea:focus { border-color: #6366f1; }
    .af-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .af-btn-primary {
      background: #4f46e5;
      border: none;
      color: white;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .af-btn-primary:hover { background: #4338ca; }
    .af-btn-danger {
      background: #dc2626;
      border: none;
      color: white;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .af-btn-danger:hover { background: #b91c1c; }
    .af-btn-secondary {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #e4e4e7;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .af-btn-secondary:hover { background: #3f3f46; }

    /* Toast notification */
    .af-toast {
      position: fixed;
      bottom: 74px;
      right: 20px;
      background: #18181b;
      color: #f4f4f5;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid #3f3f46;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.6);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.2s ease;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .af-toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    .af-toast-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .af-toast-btn:hover { background: #dc2626; }
  `;
  shadow.appendChild(style);

  // Build the DOM
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="af-highlight">
      <div class="af-tag-label"></div>
    </div>
    <div id="pins-layer"></div>

    <div class="af-bar">
      <button class="af-btn" id="toggle-mode-btn">
        <span>✏️ Review</span>
      </button>
      <span class="af-badge" id="pins-badge">0</span>
      <button class="af-btn" id="copy-btn" title="Copy structured feedback prompt for Antigravity">
        <span>📋 Copy for Agent</span>
      </button>
      <button class="af-btn" id="save-btn" title="Save directly to feedback.md or server">
        <span>💾 Save</span>
      </button>
      <button class="af-btn" id="clear-btn" title="Clear all pins" style="padding: 6px 8px; color: #a1a1aa;">
        <span>✕</span>
      </button>
    </div>

    <div class="af-modal" id="comment-modal">
      <div class="af-modal-header">
        <div class="af-modal-title">
          <span>💬 Add Change Request</span>
        </div>
        <button class="af-close-btn" id="modal-close-btn">&times;</button>
      </div>
      <div class="af-target-info" id="target-info"></div>
      <textarea class="af-textarea" id="comment-input" placeholder="Describe the change (e.g., 'Change button to dark purple and add 8px padding', 'Replace image with SVG logo', 'Fix typo: should say Overview')"></textarea>
      <div class="af-modal-actions">
        <button class="af-btn-danger" id="delete-pin-btn" style="display: none; margin-right: auto;">Delete</button>
        <button class="af-btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="af-btn-primary" id="save-pin-btn">Save Pin</button>
      </div>
    </div>

    <div class="af-toast" id="toast">Feedback copied to clipboard!</div>
  `;
  shadow.appendChild(container);

  // References
  const highlightBox = shadow.querySelector('.af-highlight');
  const tagLabel = shadow.querySelector('.af-tag-label');
  const toggleBtn = shadow.querySelector('#toggle-mode-btn');
  const pinsBadge = shadow.querySelector('#pins-badge');
  const copyBtn = shadow.querySelector('#copy-btn');
  const saveBtn = shadow.querySelector('#save-btn');
  const clearBtn = shadow.querySelector('#clear-btn');
  const pinsLayer = shadow.querySelector('#pins-layer');
  const modal = shadow.querySelector('#comment-modal');
  const modalClose = shadow.querySelector('#modal-close-btn');
  const modalCancel = shadow.querySelector('#modal-cancel-btn');
  const savePinBtn = shadow.querySelector('#save-pin-btn');
  const deletePinBtn = shadow.querySelector('#delete-pin-btn');
  const commentInput = shadow.querySelector('#comment-input');
  const targetInfo = shadow.querySelector('#target-info');
  const toast = shadow.querySelector('#toast');

  let activePinIndex = -1;
  let pendingPinData = null;

  let toastTimer = null;
  function showToastHtml(html, duration = 4000) {
    toast.innerHTML = html;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function showToast(msg, duration = 2500) {
    showToastHtml(`<span>${msg}</span>`, duration);
  }

  function updateBadge() {
    pinsBadge.textContent = pins.length;
    pinsBadge.classList.toggle('visible', pins.length > 0);
  }

  function savePins() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    } catch (e) {}
    updateBadge();
    renderPins();
  }

  // Generate robust CSS Selector
  function getSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    if (el.id) return `#${el.id}`;
    let path = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const classes = current.className
          .trim()
          .split(/\s+/)
          .filter(c => c && !c.startsWith('af-') && !c.includes(':'))
          .slice(0, 2);
        if (classes.length) selector += '.' + classes.join('.');
      }
      let sibling = current;
      let nth = 1;
      while ((sibling = sibling.previousElementSibling)) {
        if (sibling.tagName === current.tagName) nth++;
      }
      if (nth > 1) selector += `:nth-of-type(${nth})`;
      path.unshift(selector);
      if (path.length >= 3) break;
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  // Extract relevant element summary (text, img, input)
  function getElementSummary(el) {
    const tag = el.tagName.toLowerCase();
    const selector = getSelector(el);
    let preview = '';
    let attrInfo = '';

    if (tag === 'img') {
      const src = el.getAttribute('src') || el.src;
      const alt = el.getAttribute('alt') || '';
      attrInfo = `src: "${src}"${alt ? `, alt: "${alt}"` : ''}`;
    } else if (tag === 'input' || tag === 'textarea') {
      attrInfo = `placeholder: "${el.placeholder || ''}", value: "${el.value || ''}"`;
    } else {
      const text = el.innerText ? el.innerText.trim().slice(0, 60) : '';
      if (text) preview = `Current text: "${text.replace(/\s+/g, ' ')}"`;
    }

    return { tag, selector, preview, attrInfo };
  }

  function renderPins() {
    pinsLayer.innerHTML = '';
    pins.forEach((pin, index) => {
      const pinEl = document.createElement('div');
      pinEl.className = 'af-pin';
      pinEl.style.left = `${pin.x}px`;
      pinEl.style.top = `${pin.y}px`;
      pinEl.textContent = index + 1;
      pinEl.title = `Item #${index + 1}: ${pin.comment}`;
      pinEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(index);
      });
      pinsLayer.appendChild(pinEl);
    });
  }

  function openCreateModal(el, x, y) {
    activePinIndex = -1;
    const summary = getElementSummary(el);
    pendingPinData = {
      x,
      y,
      selector: summary.selector,
      tag: summary.tag,
      preview: summary.preview,
      attrInfo: summary.attrInfo,
      url: window.location.pathname + window.location.search
    };

    targetInfo.innerHTML = `<strong>&lt;${summary.tag}&gt;</strong> ${summary.selector}<br/>${summary.preview || summary.attrInfo || ''}`;
    commentInput.value = '';
    deletePinBtn.style.display = 'none';
    modal.classList.add('open');
    commentInput.focus();
  }

  function openEditModal(index) {
    activePinIndex = index;
    const pin = pins[index];
    targetInfo.innerHTML = `<strong>&lt;${pin.tag}&gt;</strong> ${pin.selector}<br/>${pin.preview || pin.attrInfo || ''}`;
    commentInput.value = pin.comment;
    deletePinBtn.style.display = 'inline-block';
    modal.classList.add('open');
    commentInput.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    commentInput.value = '';
    activePinIndex = -1;
    pendingPinData = null;
  }

  // Toggle Review Mode
  function setReviewMode(active) {
    isReviewMode = active;
    toggleBtn.classList.toggle('active', isReviewMode);
    if (!isReviewMode) {
      highlightBox.style.display = 'none';
      hoveredElement = null;
    }
  }

  toggleBtn.addEventListener('click', () => setReviewMode(!isReviewMode));

  // Inspect & Hover
  window.addEventListener('mousemove', (e) => {
    if (!isReviewMode) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === host || host.contains(target)) {
      highlightBox.style.display = 'none';
      return;
    }
    hoveredElement = target;
    const rect = target.getBoundingClientRect();
    highlightBox.style.display = 'block';
    highlightBox.style.top = `${rect.top + window.scrollY}px`;
    highlightBox.style.left = `${rect.left + window.scrollX}px`;
    highlightBox.style.width = `${rect.width}px`;
    highlightBox.style.height = `${rect.height}px`;
    tagLabel.textContent = `<${target.tagName.toLowerCase()}> ${target.id ? '#' + target.id : (target.classList[0] ? '.' + target.classList[0] : '')}`;
  }, true);

  // Click to drop pin
  window.addEventListener('click', (e) => {
    // Check if Alt + Click anywhere or normal click in review mode
    const isAltClick = e.altKey;
    if (!isReviewMode && !isAltClick) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === host || host.contains(target)) return;

    e.preventDefault();
    e.stopPropagation();

    openCreateModal(target, e.pageX, e.pageY);
  }, true);

  // Right-click convenience in review mode
  window.addEventListener('contextmenu', (e) => {
    if (!isReviewMode) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === host || host.contains(target)) return;

    e.preventDefault();
    openCreateModal(target, e.pageX, e.pageY);
  }, true);

  // Save Modal
  savePinBtn.addEventListener('click', () => {
    const comment = commentInput.value.trim();
    if (!comment) return;

    if (activePinIndex >= 0) {
      pins[activePinIndex].comment = comment;
    } else if (pendingPinData) {
      pins.push({
        ...pendingPinData,
        comment,
        timestamp: new Date().toISOString()
      });
    }

    savePins();
    closeModal();
    showToast('Pin added! Keep reviewing or click "Copy for Agent".');
  });

  // Delete Pin
  deletePinBtn.addEventListener('click', () => {
    if (activePinIndex >= 0) {
      pins.splice(activePinIndex, 1);
      savePins();
    }
    closeModal();
  });

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);

  // Clear All Pins
  clearBtn.addEventListener('click', () => {
    if (!pins.length) return;
    if (confirm(`Clear all ${pins.length} feedback pin(s)?`)) {
      pins = [];
      savePins();
      showToast('All pins cleared.');
    }
  });

  // Build Markdown Payload
  function generateMarkdown() {
    if (!pins.length) return '';
    let md = `# Visual Feedback (${new Date().toLocaleDateString()})\n\n`;
    md += `## Pending Changes (${pins.length})\n`;
    pins.forEach((p, idx) => {
      md += `- [ ] **Item #${idx + 1}** (\`${p.selector}\`)\n`;
      if (p.preview) md += `  - ${p.preview}\n`;
      if (p.attrInfo) md += `  - Attributes: ${p.attrInfo}\n`;
      md += `  - **Requested Change**: ${p.comment}\n`;
    });
    md += `\n## Instructions for Antigravity\n`;
    md += `Please locate the matching components/files for the selectors above, apply the requested changes, and update feedback.md.\n`;
    return md;
  }

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    if (!pins.length) {
      alert('No feedback pins yet! Toggle "Review" mode and click any element to add comments.');
      return;
    }
    const md = generateMarkdown();
    try {
      await navigator.clipboard.writeText(md);
    } catch (err) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // 1. Silently sync with server to register pending items in feedback.md
    try {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md, pins })
      });
    } catch (e) {}

    // 2. Show interactive toast with option to clear pins immediately or let agent auto-clear
    showToastHtml(`
      <span>📋 Copied! Paste to Agent.</span>
      <button class="af-toast-btn" id="toast-clear-btn" title="Clear pins from view now that they are in clipboard">✕ Clear Pins</button>
    `, 6000);

    const toastClear = shadow.querySelector('#toast-clear-btn');
    if (toastClear) {
      toastClear.addEventListener('click', () => {
        pins = [];
        savePins();
        toast.classList.remove('show');
      });
    }
  });

  // Save to feedback.md
  saveBtn.addEventListener('click', async () => {
    if (!pins.length) {
      alert('No feedback pins to save. Add at least one pin first.');
      return;
    }
    const md = generateMarkdown();

    // 1. Try local dev server endpoint if available
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md, pins })
      });
      if (res.ok) {
        showToast('Saved to feedback.md via dev server!');
        return;
      }
    } catch (e) {
      // Server endpoint not active, fall back to file download / copy
    }

    // 2. Fallback: Download file or File System Access API
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'feedback.md',
          types: [{ description: 'Markdown File', accept: { 'text/markdown': ['.md'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(md);
        await writable.close();
        showToast('Saved feedback.md!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // 3. Simple Download trigger
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded feedback.md!');
  });

  // Check if feedback items have been completed by the agent on the dev server
  async function checkServerSync() {
    try {
      const res = await fetch('/api/feedback');
      if (!res.ok) return;
      const data = await res.json();
      // If server reports 0 pending items and at least 1 resolved item,
      // and we still have local pins, it means the agent finished the work!
      if (data.ok && data.pendingCount === 0 && data.resolvedCount > 0 && pins.length > 0) {
        pins = [];
        savePins();
        showToast('✨ All feedback completed by agent! Pins cleared.');
      }
    } catch (e) {}
  }

  window.addEventListener('focus', checkServerSync);
  setInterval(checkServerSync, 3000);

  // Initial load
  updateBadge();
  renderPins();
  checkServerSync();
})();
