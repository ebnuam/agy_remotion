// ============================================================================
// Video Factory Studio - Frontend Controller
// ============================================================================

let currentSelectedChannel = 'otak-receh';
let currentScriptMode = 'ai'; // 'ai' or 'manual'
let activeJobId = null;
let eventSource = null;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initChannelPicker();
  initModeToggle();
  initQuickPills();
  initGenerateButton();
  initModal();
  loadVideoLibrary();
  initAssetManager();
  loadAssetGallery();
  checkSystemStatus();
});

// 1. Navigation Tabs
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tabId}`);
  });

  if (tabId === 'library') {
    loadVideoLibrary();
  }
  if (tabId === 'assets') {
    loadAssetGallery();
  }
}

// 2. Channel Picker
function initChannelPicker() {
  const cards = document.querySelectorAll('.channel-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentSelectedChannel = card.dataset.channel;
    });
  });
}

// 3. Mode Toggle (AI Director vs Manual Script)
function initModeToggle() {
  const btnAI = document.getElementById('btnModeAI');
  const btnManual = document.getElementById('btnModeManual');
  const secAI = document.getElementById('sectionAIPrompt');
  const secManual = document.getElementById('sectionManualScript');

  btnAI.addEventListener('click', () => {
    btnAI.classList.add('active');
    btnManual.classList.remove('active');
    secAI.style.display = 'block';
    secManual.style.display = 'none';
    currentScriptMode = 'ai';
  });

  btnManual.addEventListener('click', () => {
    btnManual.classList.add('active');
    btnAI.classList.remove('active');
    secAI.style.display = 'none';
    secManual.style.display = 'block';
    currentScriptMode = 'manual';
  });
}

// 4. Quick Pills
function initQuickPills() {
  const pills = document.querySelectorAll('.pill-btn');
  const textarea = document.getElementById('inputTopic');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      textarea.value = pill.dataset.topic;
      textarea.focus();
    });
  });
}

// 5. Generate Button & Pipeline Execution
function initGenerateButton() {
  const btn = document.getElementById('btnGenerate');
  btn.addEventListener('click', async () => {
    let payload = {
      channel_id: currentSelectedChannel,
      target_duration: parseInt(document.getElementById('selectDuration').value, 10),
      aspect_ratio: document.getElementById('selectRatio').value,
      voice: document.getElementById('selectVoice').value,
    };

    if (currentScriptMode === 'ai') {
      const topic = document.getElementById('inputTopic').value.trim();
      if (!topic) {
        alert('Silakan masukkan topik atau ide video!');
        return;
      }
      payload.topic = topic;
    } else {
      const rawJSON = document.getElementById('inputManualJSON').value.trim();
      if (!rawJSON) {
        alert('Silakan paste naskah JSON manual Anda!');
        return;
      }
      try {
        payload.manual_script = JSON.parse(rawJSON);
      } catch (e) {
        alert('Format JSON naskah tidak valid: ' + e.message);
        return;
      }
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '⏳ MENGIRIM PERINTAH PRODUKSI...';

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memulai job');
      }

      activeJobId = data.job_id;
      document.getElementById('activeJobIndicator').style.display = 'inline-block';

      // Switch directly to Live Monitor
      switchTab('monitor');
      startJobMonitoring(activeJobId);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span class="btn-icon">🚀</span> MULAI GENERATE VIDEO SEKARANG';
    }
  });

  // Clear log button
  document.getElementById('btnClearLog').addEventListener('click', () => {
    document.getElementById('terminalLogs').innerHTML = '';
  });
}

// 6. Real-time Live Monitor with SSE
function startJobMonitoring(jobId) {
  if (eventSource) {
    eventSource.close();
  }

  // Reset stepper & progress
  resetStepper();
  document.getElementById('monitorResultBox').style.display = 'none';
  document.getElementById('terminalLogs').innerHTML = '';

  eventSource = new EventSource(`/api/jobs/${jobId}/events`);

  eventSource.onmessage = (event) => {
    const job = JSON.parse(event.data);
    updateMonitorUI(job);

    if (job.phase === 'COMPLETED' || job.phase === 'FAILED') {
      eventSource.close();
      document.getElementById('activeJobIndicator').style.display = 'none';
    }
  };

  eventSource.onerror = () => {
    // Fallback polling if SSE fails
    pollJobStatus(jobId);
  };
}

function updateMonitorUI(job) {
  document.getElementById('monitorJobTitle').innerText = job.topic || job.id;
  document.getElementById('monitorJobChannel').innerText = (job.channel_name || job.channel_id).toUpperCase();
  document.getElementById('monitorStatusText').innerText = job.status_message || job.phase;
  document.getElementById('monitorPercentText').innerText = `${job.progress}%`;
  document.getElementById('monitorProgressBar').style.width = `${job.progress}%`;

  // Update Stepper
  const phase = job.phase;
  updateStepperPhase(phase, job.progress);

  // Update Logs
  const terminal = document.getElementById('terminalLogs');
  if (job.logs && job.logs.length > 0) {
    terminal.innerHTML = job.logs.map(line => {
      let colorClass = 'text-muted';
      if (line.includes('[COMPLETED]') || line.includes('[SUCCESS]') || line.includes('[QC PASS]')) colorClass = 'text-green';
      else if (line.includes('[FAILED]') || line.includes('[FATAL]')) colorClass = 'text-red';
      else if (line.includes('[WARN]')) colorClass = 'text-yellow';
      else if (line.includes('[INFO]') || line.includes('[Step')) colorClass = 'text-blue';
      return `<div class="log-line ${colorClass}">${escapeHtml(line)}</div>`;
    }).join('');
    terminal.scrollTop = terminal.scrollHeight;
  }

  // If Completed, show Result Preview Button
  if (job.phase === 'COMPLETED') {
    const box = document.getElementById('monitorResultBox');
    box.style.display = 'block';
    const btnPreview = document.getElementById('btnPreviewResult');
    btnPreview.onclick = () => {
      openVideoModal(job);
    };
  }
}

function updateStepperPhase(phase, progress) {
  const steps = [
    { num: 1, key: 'GENERATING_CONCEPT' },
    { num: 2, key: 'WRITING_SCRIPT' },
    { num: 3, key: 'GENERATING_AUDIO' },
    { num: 4, key: 'ALIGNING_TIMINGS' },
    { num: 5, key: 'RENDERING_VIDEO' },
    { num: 6, key: 'QUALITY_CHECK' },
  ];

  let currentActiveIndex = 0;
  if (phase === 'GENERATING_CONCEPT') currentActiveIndex = 1;
  else if (phase === 'WRITING_SCRIPT') currentActiveIndex = 2;
  else if (phase === 'GENERATING_AUDIO') currentActiveIndex = 3;
  else if (phase === 'ALIGNING_TIMINGS') currentActiveIndex = 4;
  else if (phase === 'RENDERING_VIDEO') currentActiveIndex = 5;
  else if (phase === 'QUALITY_CHECK') currentActiveIndex = 6;
  else if (phase === 'COMPLETED') currentActiveIndex = 7;

  document.querySelectorAll('.step-item').forEach(item => {
    const stepNum = parseInt(item.dataset.step, 10);
    if (stepNum < currentActiveIndex) {
      item.className = 'step-item completed';
      item.querySelector('.step-circle').innerHTML = '✓';
    } else if (stepNum === currentActiveIndex) {
      item.className = 'step-item active';
      item.querySelector('.step-circle').innerHTML = '⏳';
    } else {
      item.className = 'step-item';
      item.querySelector('.step-circle').innerHTML = stepNum;
    }
  });
}

function resetStepper() {
  document.querySelectorAll('.step-item').forEach(item => {
    const stepNum = item.dataset.step;
    item.className = 'step-item';
    item.querySelector('.step-circle').innerHTML = stepNum;
  });
  document.getElementById('monitorProgressBar').style.width = '0%';
  document.getElementById('monitorPercentText').innerText = '0%';
}

async function pollJobStatus(jobId) {
  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    const data = await res.json();
    if (data.success && data.job) {
      updateMonitorUI(data.job);
      if (data.job.phase !== 'COMPLETED' && data.job.phase !== 'FAILED') {
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    }
  } catch (e) {
    console.error('Polling error:', e);
  }
}

// 7. Video Library Loader
async function loadVideoLibrary() {
  const grid = document.getElementById('libraryGrid');
  try {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    if (!data.success || !data.jobs) return;

    const completed = data.jobs.filter(j => j.phase === 'COMPLETED' && j.video_url);
    document.getElementById('videoCountBadge').innerText = completed.length;

    if (completed.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
          <div style="font-size: 48px; margin-bottom: 12px;">🎞️</div>
          <h3>Belum ada video yang diproduksi</h3>
          <p>Mulai dengan mengklik tab 'Create Video' di atas untuk memproduksi video pertama Anda!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = completed.map(j => {
      const sizeMB = j.file_size ? (j.file_size / (1024 * 1024)).toFixed(1) + ' MB' : '-';
      const dur = j.audio_duration ? j.audio_duration.toFixed(1) + 's' : '-';
      const time = new Date(j.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="video-card">
          <div class="video-thumb" onclick='openVideoById("${j.id}")'>
            <div class="thumb-play-btn">▶</div>
          </div>
          <div class="video-card-body">
            <div style="margin-bottom: 6px;">
              <span class="badge" style="background:#FF7A00; color:#fff;">${j.channel_name || j.channel_id}</span>
            </div>
            <h4 class="video-card-title">${escapeHtml(j.topic || j.id)}</h4>
            <div class="video-card-meta">
              <span>⏱ ${dur} · ${sizeMB}</span>
              <span>${time}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading library:', err);
  }
}

window.openVideoById = async function(jobId) {
  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    const data = await res.json();
    if (data.success && data.job) {
      openVideoModal(data.job);
    }
  } catch (e) {
    alert('Gagal memuat video: ' + e.message);
  }
};

// 8. Video Modal Player
function initModal() {
  const modal = document.getElementById('videoModal');
  const btnClose = document.getElementById('btnCloseModal');
  const player = document.getElementById('modalVideoPlayer');

  btnClose.addEventListener('click', () => {
    modal.classList.remove('active');
    player.pause();
    player.src = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      player.pause();
      player.src = '';
    }
  });
}

function openVideoModal(job) {
  const modal = document.getElementById('videoModal');
  const player = document.getElementById('modalVideoPlayer');

  document.getElementById('modalVideoTitle').innerText = job.topic || job.id;
  document.getElementById('modalChannelName').innerText = (job.channel_name || job.channel_id).toUpperCase();
  document.getElementById('modalDuration').innerText = job.audio_duration ? `${job.audio_duration.toFixed(1)} Detik` : '-';
  document.getElementById('modalFileSize').innerText = job.file_size ? `${(job.file_size / (1024 * 1024)).toFixed(2)} MB` : '-';

  const downloadBtn = document.getElementById('btnDownloadVideo');
  downloadBtn.href = job.video_url;
  downloadBtn.setAttribute('download', `${job.id}.mp4`);

  player.src = job.video_url;
  player.load();
  modal.classList.add('active');
}

// 9. System Status Checker
async function checkSystemStatus() {
  try {
    const res = await fetch('/api/system/status');
    const data = await res.json();
    if (data.status === 'ONLINE') {
      document.getElementById('systemStatusText').innerText = 'Studio Online';
    }
  } catch (e) {
    document.getElementById('systemStatusText').innerText = 'Offline';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// 10. Asset Manager & Drag & Drop Upload Controller (FASE 2)
// ============================================================================
function initAssetManager() {
  const dropzone = document.getElementById('assetDropzone');
  const fileInput = document.getElementById('assetFileInput');
  const btnRefresh = document.getElementById('btnRefreshAssets');

  if (!dropzone || !fileInput) return;

  // Open file dialog on dropzone click
  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFilesUpload(files);
    fileInput.value = ''; // Reset input
  });

  // Drag & drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    handleFilesUpload(files);
  });

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadAssetGallery();
      showToast('Daftar aset diperbarui!', 'success');
    });
  }
}

async function handleFilesUpload(files) {
  if (!files || files.length === 0) return;

  let successCount = 0;
  for (const file of files) {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.json'];
    if (!allowed.includes(ext)) {
      showToast(`Format file '${file.name}' tidak didukung. Hanya .png, .jpg, .jpeg, .svg, .json`, 'error');
      continue;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah');
      }

      successCount++;
      showToast(`Aset '${data.filename}' berhasil diunggah!`, 'success');
    } catch (err) {
      showToast(`Gagal mengunggah '${file.name}': ${err.message}`, 'error');
    }
  }

  if (successCount > 0) {
    loadAssetGallery();
  }
}

async function loadAssetGallery() {
  const grid = document.getElementById('assetGrid');
  const countSpan = document.getElementById('assetTotalCount');
  const badgeCount = document.getElementById('assetCountBadge');

  if (!grid) return;

  try {
    const res = await fetch('/api/assets');
    const data = await res.json();
    if (!data.success || !data.assets) return;

    const assets = data.assets;
    if (countSpan) countSpan.innerText = assets.length;
    if (badgeCount) badgeCount.innerText = assets.length;

    if (assets.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 48px 20px; color: var(--text-dim);">
          <div style="font-size: 42px; margin-bottom: 12px;">🖼️</div>
          <h3>Belum ada aset yang diunggah</h3>
          <p>Tarik & lepas file gambar (.png, .jpg, .svg) atau Lottie (.json) ke area di atas untuk memulai world-building!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = assets.map(a => {
      const sizeKB = (a.size / 1024).toFixed(1) + ' KB';
      const isLottie = a.type === 'lottie';

      return `
        <div class="asset-card">
          <div class="asset-thumb">
            ${isLottie 
              ? `<div class="lottie-badge">✨ JSON</div>`
              : `<img src="${a.asset_url}" alt="${escapeHtml(a.name)}" loading="lazy">`
            }
          </div>
          <div class="asset-info">
            <span class="asset-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
            <span class="asset-meta">${a.type.toUpperCase()} · ${sizeKB}</span>
            <button type="button" class="btn-copy-asset" onclick="copyAssetNameToClipboard('${escapeHtml(a.name)}')">
              📋 Salin Nama Aset
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading asset gallery:', err);
  }
}

window.copyAssetNameToClipboard = function(name) {
  navigator.clipboard.writeText(name).then(() => {
    showToast(`Nama aset '${name}' disalin ke clipboard!`, 'success');
  }).catch(() => {
    showToast(`Nama aset: ${name}`, 'success');
  });
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
