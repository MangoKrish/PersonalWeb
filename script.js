// ============================================
// AKSHAY KRISHNA SIRIGANA - PORTFOLIO
// Combined: Theme toggle, Navigation, Typewriter,
// Project tabs, Clock, Sticker wobble
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const cards = ['home', 'about', 'skills', 'project', 'interests', 'contact'];
  let currentIndex = 0;

  const cardElements = cards.map(name => document.getElementById(`card-${name}`));
  const menuItems = document.querySelectorAll('.menu-item[data-card]');
  const counter = document.getElementById('cardCounter');

  // --- Card Navigation ---
  function showCard(index) {
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;
    cardElements.forEach(el => el.classList.remove('active'));
    cardElements[index].classList.add('active');
    menuItems.forEach(item => {
      item.classList.toggle('active', item.dataset.card === cards[index]);
    });
    counter.textContent = `${index + 1} / ${cards.length}`;
    document.querySelector('.canvas-area').scrollTop = 0;
  }

  // Menu clicks
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.dataset.card;
      if (name === 'prev') showCard(currentIndex - 1);
      else if (name === 'next') showCard(currentIndex + 1);
      else {
        const idx = cards.indexOf(name);
        if (idx !== -1) showCard(idx);
      }
    });
  });

  // Toolbar buttons
  document.querySelectorAll('.bar-btn[data-card]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.card === 'prev') showCard(currentIndex - 1);
      else if (btn.dataset.card === 'next') showCard(currentIndex + 1);
    });
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      showCard(currentIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      showCard(currentIndex - 1);
    }
  });

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('themeToggle');
  const toggleIcon = document.getElementById('toggleIcon');
  const html = document.documentElement;

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateToggleIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateToggleIcon(next);
  });

  function updateToggleIcon(theme) {
    // Sun for dark mode (click to go light), Moon for light mode (click to go dark)
    toggleIcon.textContent = theme === 'dark' ? '\u2600' : '\u263E';
    themeToggle.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  }

  // --- Project Tabs ---
  const projectTabs = document.querySelectorAll('.project-tab');
  const projectPanels = document.querySelectorAll('.project-panel');

  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.project;
      projectTabs.forEach(t => t.classList.remove('active'));
      projectPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`project-${target}`).classList.add('active');
    });
  });

  // --- Typewriter effect ---
  const typedEl = document.getElementById('typedLine');
  if (typedEl) {
    const lines = [
      '> hello world',
      '> akshay.init()',
      '> loading skills...',
      '> ready.'
    ];
    let lineIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let pause = 0;

    function typeLoop() {
      if (pause > 0) {
        pause--;
        setTimeout(typeLoop, 60);
        return;
      }

      const line = lines[lineIdx];

      if (!deleting) {
        typedEl.textContent = line.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx >= line.length) {
          pause = 25;
          deleting = true;
        }
        setTimeout(typeLoop, 55 + Math.random() * 40);
      } else {
        typedEl.textContent = line.substring(0, charIdx);
        charIdx--;
        if (charIdx <= 0) {
          deleting = false;
          lineIdx = (lineIdx + 1) % lines.length;
          pause = 8;
        }
        setTimeout(typeLoop, 30);
      }
    }

    setTimeout(typeLoop, 600);
  }

  // --- Live clock ---
  const timeEl = document.getElementById('barTime');
  function updateTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    timeEl.textContent = `${h}:${m}`;
  }
  updateTime();
  setInterval(updateTime, 30000);

  // --- Sidebar sticker animations + fanfare ---
  const stickerAnims = ['anim-spin', 'anim-heartbeat', 'anim-jelly', 'anim-float', 'anim-wiggle', 'anim-pop'];
  const stickerEmoji = [
    ['✨', '⭐', '🌟', '💫'],
    ['💖', '💕', '💗', '💘', '🩷'],
    ['⚡', '🔥', '💥', '✴️'],
    ['🌸', '🌺', '🌷', '🌼', '🪻'],
    ['🎵', '🎶', '🎤', '🎸', '🎹'],
    ['💻', '🚀', '⌨️', '🧑‍💻']
  ];

  function spawnFanfare(el, emojis) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Glow ring
    const glow = document.createElement('div');
    glow.className = 'sticker-glow';
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    document.body.appendChild(glow);
    glow.addEventListener('animationend', () => glow.remove());

    // Particles
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'sticker-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const dist = 40 + Math.random() * 50;
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
      p.style.setProperty('--pr', (Math.random() * 360) + 'deg');
      p.style.animationDelay = (Math.random() * 0.1) + 's';
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  document.querySelectorAll('.sidebar-item').forEach((item, i) => {
    const animClass = stickerAnims[i % stickerAnims.length];
    const emojis = stickerEmoji[i % stickerEmoji.length];
    item.addEventListener('click', () => {
      item.classList.remove(animClass);
      void item.offsetWidth;
      item.classList.add(animClass);
      spawnFanfare(item, emojis);
    });
    item.addEventListener('animationend', () => {
      item.classList.remove(animClass);
    });
  });

  // Initialize
  showCard(0);
});
