// ==========================================================
// AKSHAY KRISHNA SIRIGANA — PORTFOLIO, ISSUE 01
// Theme switch · folio indicator · scroll reveals ·
// FLIP filtering · skill cross-links · plates · chess · copy
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Masthead load animation (one-time) ---
  if (!reducedMotion) html.classList.add('anim');

  // --- Theme switch (pre-paint theme set inline in <head>) ---
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.setAttribute('aria-checked', String(html.getAttribute('data-theme') === 'ink'));
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'ink' ? 'paper' : 'ink';
    html.classList.add('theming');
    html.setAttribute('data-theme', next);
    themeToggle.setAttribute('aria-checked', String(next === 'ink'));
    try { localStorage.setItem('aks-theme', next); } catch (e) { /* private mode */ }
    setTimeout(() => html.classList.remove('theming'), 300);
  });

  // --- Running header + scroll progress ---
  const header = document.getElementById('runningHeader');
  const progress = document.getElementById('scrollProgress');
  const masthead = document.querySelector('.masthead');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('visible', y > masthead.offsetHeight * 0.72);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Folio indicator ---
  const folio = document.getElementById('folioIndicator');
  const folioSections = document.querySelectorAll('[data-folio]');
  const folioIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) folio.textContent = entry.target.dataset.folio;
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  folioSections.forEach((s) => folioIO.observe(s));

  // --- Scroll reveals ---
  document.querySelectorAll('.reveal').forEach((el) => {
    const inner = document.createElement('span');
    inner.className = 'reveal-inner';
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);
  });

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .rise').forEach((el) => revealIO.observe(el));

  // --- Generative figure plates (deterministic per project) ---
  const PLATE_CHARS = ['·', '▘', '▝', '▖', '▗', '▚', '▞', '▌', '█', ' ', ' ', ' '];
  function seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return () => {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      return ((h >>> 0) % 1000) / 1000;
    };
  }
  document.querySelectorAll('.plate').forEach((plate) => {
    const rand = seeded(plate.dataset.plate || 'plate');
    const rows = 7, cols = 24;
    let out = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = rand();
        if (v > 0.94) {
          out += '<b>' + PLATE_CHARS[Math.floor(rand() * 8)] + '</b>';
        } else {
          out += PLATE_CHARS[Math.floor(v * PLATE_CHARS.length)];
        }
      }
      if (r < rows - 1) out += '\n';
    }
    plate.innerHTML = out;
  });

  // --- Project directory: filtering (category + stack) with FLIP ---
  const items = Array.from(document.querySelectorAll('.work-item'));
  const chips = Array.from(document.querySelectorAll('.chip[data-filter]'));
  const stackChip = document.getElementById('stackChip');
  const countEl = document.getElementById('filterCount');
  const total = items.length;

  // live counts on chips
  chips.forEach((chip) => {
    const f = chip.dataset.filter;
    const n = f === 'all' ? total : items.filter((it) => it.dataset.cat === f).length;
    chip.querySelector('.chip-count').textContent = String(n).padStart(2, '0');
  });

  function visibleItems() {
    return items.filter((it) => !it.hasAttribute('hidden'));
  }

  const flipTimers = new WeakMap();

  function applyFilter(pred) {
    // cancel any in-flight FLIP cleanup before measuring, so rapid
    // re-filters measure resting positions, not mid-transition ones
    items.forEach((it) => {
      const t = flipTimers.get(it);
      if (t !== undefined) {
        clearTimeout(t);
        flipTimers.delete(it);
      }
      it.classList.remove('flip-move');
      it.style.transform = '';
      it.style.opacity = '';
    });

    const first = new Map(visibleItems().map((it) => [it, it.getBoundingClientRect().top]));
    items.forEach((it) => {
      if (pred(it)) it.removeAttribute('hidden');
      else it.setAttribute('hidden', '');
    });
    const shown = visibleItems();
    countEl.textContent = `${String(total).padStart(2, '0')} PROJECTS / ${String(shown.length).padStart(2, '0')} SHOWN`;

    if (!reducedMotion) {
      shown.forEach((it) => {
        const before = first.get(it);
        if (before === undefined) {
          it.style.opacity = '0';
          requestAnimationFrame(() => {
            it.classList.add('flip-move');
            it.style.opacity = '1';
            flipTimers.set(it, setTimeout(() => { it.classList.remove('flip-move'); it.style.opacity = ''; flipTimers.delete(it); }, 320));
          });
          return;
        }
        const delta = before - it.getBoundingClientRect().top;
        if (Math.abs(delta) < 2) return;
        it.style.transform = `translateY(${delta}px)`;
        requestAnimationFrame(() => {
          it.classList.add('flip-move');
          it.style.transform = '';
          flipTimers.set(it, setTimeout(() => { it.classList.remove('flip-move'); flipTimers.delete(it); }, 320));
        });
      });
    }
  }

  function setActiveChip(activeChip) {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === activeChip)));
  }

  function filterByCategory(cat, updateHash = true) {
    stackChip.hidden = true;
    setActiveChip(chips.find((c) => c.dataset.filter === cat) || chips[0]);
    applyFilter((it) => cat === 'all' || it.dataset.cat === cat);
    if (updateHash) {
      history.replaceState(null, '', cat === 'all' ? '#work' : `#work=${cat}`);
    }
  }

  function filterByStack(token, label, updateHash = true) {
    setActiveChip(null);
    stackChip.hidden = false;
    stackChip.textContent = `STACK: ${label} ✕`;
    stackChip.setAttribute('aria-label', `Clear stack filter: ${label}`);
    applyFilter((it) => (` ${it.dataset.stack} `).includes(` ${token} `));
    if (updateHash) history.replaceState(null, '', `#work=stack:${token}`);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => filterByCategory(chip.dataset.filter));
  });
  stackChip.addEventListener('click', () => {
    filterByCategory('all');
    chips[0].focus(); // the chip that had focus just got hidden
  });

  // --- Skills: live counts + cross-link into the index ---
  document.querySelectorAll('button.skill').forEach((btn) => {
    const token = btn.dataset.skill;
    const label = btn.textContent.trim();
    const n = items.filter((it) => (` ${it.dataset.stack} `).includes(` ${token} `)).length;
    const count = document.createElement('span');
    count.className = 'skill-count';
    count.textContent = n > 0 ? `USED IN ${String(n).padStart(2, '0')}` : '—';
    btn.appendChild(count);
    if (n === 0) {
      btn.disabled = true;
      btn.classList.add('skill-plain');
      return;
    }
    btn.addEventListener('click', () => {
      filterByStack(token, label);
      document.getElementById('work').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  // --- Restore filter / open project from URL hash ---
  (function initFromHash() {
    let h;
    try {
      h = decodeURIComponent(location.hash.slice(1));
    } catch (e) {
      h = ''; // malformed percent-encoding in a shared link
    }
    if (h.startsWith('work=stack:')) {
      const token = h.slice('work=stack:'.length);
      const btn = document.querySelector(`button.skill[data-skill="${CSS.escape(token)}"]`);
      if (btn && !btn.disabled) filterByStack(token, btn.firstChild.textContent.trim(), false);
    } else if (h.startsWith('work=')) {
      const cat = h.slice('work='.length);
      if (chips.some((c) => c.dataset.filter === cat)) filterByCategory(cat, false);
    } else if (h.startsWith('p-')) {
      const row = document.getElementById(h);
      if (row) row.setAttribute('open', '');
    }
  })();

  // --- Copy email ---
  const copyBtn = document.getElementById('copyEmail');
  const copyStatus = document.getElementById('copyStatus');
  let copyTimer;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      clearTimeout(copyTimer);
      copyBtn.textContent = 'COPIED ✓';
      copyBtn.classList.add('copied');
      copyStatus.textContent = 'Email copied to clipboard';
      copyTimer = setTimeout(() => {
        copyBtn.textContent = 'COPY';
        copyBtn.classList.remove('copied');
        copyStatus.textContent = '';
      }, 1600);
    } catch (e) {
      location.href = 'mailto:' + copyBtn.dataset.email;
    }
  });

  // ==========================================================
  // PULSE — first-party stats beacon + live correspondence chess
  // Backend: zero-dependency Node service self-hosted at PULSE.
  // Everything below fails silent: the site is fully functional
  // with the backend down (board falls back to exhibition mode).
  // ==========================================================
  const PULSE = 'https://aks-pulse.vercel.app';
  const DNT = navigator.doNotTrack === '1' || window.doNotTrack === '1';

  function getVid() {
    try {
      let v = localStorage.getItem('aks-vid');
      if (!v) {
        v = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('aks-vid', v);
      }
      return v;
    } catch (e) {
      return 'anon';
    }
  }
  const vid = getVid();

  function beacon(type, label) {
    if (DNT) return;
    try {
      // plain-string body: CORS-safelisted (no preflight), server parses JSON regardless
      const body = JSON.stringify({ vid, type, label: String(label || '').slice(0, 80) });
      if (!navigator.sendBeacon || !navigator.sendBeacon(`${PULSE}/api/beacon`, body)) {
        fetch(`${PULSE}/api/beacon`, { method: 'POST', body, keepalive: true }).catch(() => {});
      }
    } catch (e) { /* stats are best-effort */ }
  }

  beacon('pageview', location.hash || '/');

  const seenSections = new Set();
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (entry.isIntersecting && !seenSections.has(id)) {
        seenSections.add(id);
        beacon('section', id);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('main .section').forEach((s) => sectionIO.observe(s));

  document.querySelectorAll('.work-row').forEach((row) => {
    row.addEventListener('toggle', () => { if (row.open) beacon('project', row.id.replace(/^p-/, '')); });
  });
  chips.forEach((chip) => chip.addEventListener('click', () => beacon('filter', chip.dataset.filter)));
  document.querySelectorAll('button.skill:not([disabled])').forEach((b) => b.addEventListener('click', () => beacon('skill', b.dataset.skill)));
  themeToggle.addEventListener('click', () => beacon('theme', html.getAttribute('data-theme')));
  copyBtn.addEventListener('click', () => beacon('copy_email', ''));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href.startsWith('http')) beacon('outbound', a.hostname + a.pathname.slice(0, 40));
    else if (href.endsWith('.pdf')) beacon('resume', '');
  });

  // --- Chess: live correspondence board (visitor plays White) ---
  const board = document.getElementById('chessboard');
  const statusEl = document.getElementById('chessStatus');
  const movesEl = document.getElementById('chessMoves');
  const figEl = document.getElementById('chessFig');
  const resetBtn = document.getElementById('chessReset');

  if (board) {
    const FILES = 'abcdefgh';
    const GLYPH = {
      w: { P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔' },
      b: { P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' },
    };
    const BACK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    const sq = (f, r) => `${f},${r}`;
    const coord = (f, r) => FILES[f] + (8 - r);

    function startBoard() {
      const b = {};
      BACK.forEach((t, f) => { b[sq(f, 0)] = { t, c: 'b' }; b[sq(f, 7)] = { t, c: 'w' }; });
      for (let f = 0; f < 8; f++) { b[sq(f, 1)] = { t: 'P', c: 'b' }; b[sq(f, 6)] = { t: 'P', c: 'w' }; }
      return b;
    }

    function pathClear(b, f1, r1, f2, r2) {
      const df = Math.sign(f2 - f1), dr = Math.sign(r2 - r1);
      let f = f1 + df, r = r1 + dr;
      while (f !== f2 || r !== r2) {
        if (b[sq(f, r)]) return false;
        f += df; r += dr;
      }
      return true;
    }

    // House rules: no castling, no en passant, kings may be captured.
    function isLegal(b, from, to, color) {
      const [f1, r1] = from, [f2, r2] = to;
      if (f2 < 0 || f2 > 7 || r2 < 0 || r2 > 7) return false;
      const p = b[sq(f1, r1)];
      if (!p || p.c !== color) return false;
      const target = b[sq(f2, r2)];
      if (target && target.c === color) return false;
      const df = f2 - f1, dr = r2 - r1, adf = Math.abs(df), adr = Math.abs(dr);
      switch (p.t) {
        case 'P': {
          const dir = p.c === 'w' ? -1 : 1;
          const home = p.c === 'w' ? 6 : 1;
          if (df === 0 && dr === dir && !target) return true;
          if (df === 0 && dr === 2 * dir && r1 === home && !target && !b[sq(f1, r1 + dir)]) return true;
          if (adf === 1 && dr === dir && target) return true;
          return false;
        }
        case 'N': return (adf === 1 && adr === 2) || (adf === 2 && adr === 1);
        case 'B': return adf === adr && adf > 0 && pathClear(b, f1, r1, f2, r2);
        case 'R': return (df === 0 || dr === 0) && (adf + adr > 0) && pathClear(b, f1, r1, f2, r2);
        case 'Q': return ((adf === adr && adf > 0) || df === 0 || dr === 0) && pathClear(b, f1, r1, f2, r2);
        case 'K': return adf <= 1 && adr <= 1 && (adf + adr > 0);
        default: return false;
      }
    }

    // Replay a move list from the start position -> {b, turn, status}
    function replay(moves) {
      const b = startBoard();
      let status = 'active';
      moves.forEach((m) => {
        const p = b[sq(m.f[0], m.f[1])];
        if (!p) return;
        const target = b[sq(m.t[0], m.t[1])];
        if (target && target.t === 'K') status = target.c === 'b' ? 'won_v' : 'won_o';
        delete b[sq(m.f[0], m.f[1])];
        const promo = p.t === 'P' && (m.t[1] === 0 || m.t[1] === 7);
        b[sq(m.t[0], m.t[1])] = { t: promo ? 'Q' : p.t, c: p.c };
      });
      return { b, turn: moves.length % 2 === 0 ? 'w' : 'b', status };
    }

    // --- DOM: 64 square buttons + piece layer ---
    const squares = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cb-sq' + ((r + f) % 2 ? ' dark' : '');
        cell.dataset.f = f;
        cell.dataset.r = r;
        cell.setAttribute('aria-label', coord(f, r) + ', empty');
        board.appendChild(cell);
        squares.push(cell);
      }
    }
    const pieceLayer = {};

    function render(b) {
      Object.keys(pieceLayer).forEach((k) => {
        if (!b[k]) { pieceLayer[k].remove(); delete pieceLayer[k]; }
      });
      Object.entries(b).forEach(([k, p]) => {
        const [f, r] = k.split(',').map(Number);
        let el = pieceLayer[k];
        const glyph = GLYPH[p.c][p.t];
        if (!el) {
          el = document.createElement('span');
          el.className = 'cb-piece';
          el.setAttribute('aria-hidden', 'true');
          board.appendChild(el);
          pieceLayer[k] = el;
        }
        el.textContent = glyph;
        el.style.setProperty('--f', f);
        el.style.setProperty('--r', r);
      });
      squares.forEach((cell) => {
        const p = b[sq(+cell.dataset.f, +cell.dataset.r)];
        const name = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' };
        cell.setAttribute('aria-label', `${coord(+cell.dataset.f, +cell.dataset.r)}, ${p ? (p.c === 'w' ? 'white ' : 'black ') + name[p.t] : 'empty'}`);
      });
    }

    // Move a piece with animation (used for smooth transitions)
    function animateMove(m) {
      const from = sq(m.f[0], m.f[1]), to = sq(m.t[0], m.t[1]);
      const el = pieceLayer[from];
      if (!el) return;
      if (pieceLayer[to]) pieceLayer[to].remove();
      delete pieceLayer[from];
      pieceLayer[to] = el;
      el.style.setProperty('--f', m.t[0]);
      el.style.setProperty('--r', m.t[1]);
    }

    function moveList(moves) {
      let out = '';
      for (let i = 0; i < moves.length; i += 2) {
        out += `${i / 2 + 1}. ${coord(...moves[i].f)}–${coord(...moves[i].t)}`;
        if (moves[i + 1]) out += ` ${coord(...moves[i + 1].f)}–${coord(...moves[i + 1].t)}`;
        out += '  ';
      }
      return out.trim();
    }

    // --- Exhibition fallback: the Italian Game, three moves in ---
    function exhibition() {
      board.classList.add('cb-static');
      render(startBoard());
      const MOVES = [
        { f: [4, 6], t: [4, 4] }, { f: [4, 1], t: [4, 3] },
        { f: [6, 7], t: [5, 5] }, { f: [1, 0], t: [2, 2] },
        { f: [5, 7], t: [2, 4] }, { f: [5, 0], t: [2, 3] },
      ];
      statusEl.textContent = '';
      figEl.textContent = 'FIG. 11 — THE ITALIAN GAME, THREE MOVES IN';
      if (reducedMotion) {
        render(replay(MOVES).b);
      } else {
        const io = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            MOVES.forEach((m, i) => setTimeout(() => animateMove(m), 900 + i * 850));
          }
        }, { threshold: 0.4 });
        io.observe(board);
      }
    }

    // --- Live game ---
    let game = null;
    let selected = null;

    function myTurn() {
      return game && game.status === 'active' && game.moves.length % 2 === 0;
    }

    function updateUI() {
      const { b, status } = replay(game.moves);
      render(b);
      movesEl.textContent = moveList(game.moves);
      resetBtn.hidden = game.moves.length === 0 && status === 'active';
      figEl.textContent = 'FIG. 11 — OPEN CHALLENGE · YOU PLAY WHITE';
      if (status === 'won_v') statusEl.textContent = 'YOU TOOK MY KING. WELL PLAYED — REMATCH?';
      else if (status === 'won_o') statusEl.textContent = 'GOT YOUR KING. GOOD GAME — REMATCH?';
      else if (myTurn()) statusEl.textContent = game.moves.length ? 'I MOVED. YOUR TURN — TAP A WHITE PIECE.' : 'YOUR MOVE — TAP A WHITE PIECE.';
      else statusEl.textContent = 'SENT. THE MOVE IS ON MY DESK — CHECK BACK SOON.';
      if (status !== 'active') resetBtn.hidden = false;
    }

    async function api(path, payload) {
      const res = await fetch(`${PULSE}${path}`, payload ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      } : undefined);
      if (!res.ok) throw new Error(`pulse ${res.status}`);
      return res.json();
    }

    // While waiting on the owner's reply, quietly poll so an open tab
    // sees the response without a refresh.
    let pollTimer;
    function schedulePoll() {
      clearInterval(pollTimer);
      pollTimer = setInterval(async () => {
        if (document.hidden || !game) return;
        if (myTurn() || replay(game.moves).status !== 'active') { clearInterval(pollTimer); return; }
        try {
          const resp = await api(`/api/game?vid=${encodeURIComponent(vid)}`, null);
          if (resp.game && resp.game.moves.length > game.moves.length) {
            const reply = resp.game.moves[game.moves.length];
            game = resp.game;
            animateMove(reply);
            setTimeout(updateUI, 500);
          }
        } catch (e) { /* next tick */ }
      }, 45000);
    }

    function clearSelection() {
      selected = null;
      squares.forEach((c) => c.classList.remove('cb-selected', 'cb-target'));
    }

    async function onSquare(cell) {
      if (!game || !myTurn()) return;
      const f = +cell.dataset.f, r = +cell.dataset.r;
      const { b } = replay(game.moves);
      const here = b[sq(f, r)];
      if (selected === null) {
        if (here && here.c === 'w') {
          selected = [f, r];
          cell.classList.add('cb-selected');
          squares.forEach((c) => {
            if (isLegal(b, selected, [+c.dataset.f, +c.dataset.r], 'w')) c.classList.add('cb-target');
          });
        }
        return;
      }
      if (selected[0] === f && selected[1] === r) { clearSelection(); return; }
      if (here && here.c === 'w') { clearSelection(); onSquare(cell); return; }
      if (!isLegal(b, selected, [f, r], 'w')) return;
      const move = { f: selected, t: [f, r] };
      clearSelection();
      game.moves.push(move);
      animateMove(move);
      updateUI();
      beacon('chess_move', coord(...move.f) + coord(...move.t));
      try {
        game = (await api('/api/move', { vid, f: move.f, t: move.t })).game;
        updateUI();
        schedulePoll();
      } catch (e) {
        game.moves.pop();
        updateUI();
        statusEl.textContent = 'COULD NOT REACH THE BOARD — TRY AGAIN IN A MINUTE.';
      }
    }

    squares.forEach((cell) => cell.addEventListener('click', () => onSquare(cell)));

    resetBtn.addEventListener('click', async () => {
      try {
        game = (await api('/api/reset', { vid })).game;
        clearSelection();
        updateUI();
        beacon('chess_reset', '');
      } catch (e) { /* keep current state */ }
    });

    (async () => {
      try {
        const resp = await api(`/api/game?vid=${encodeURIComponent(vid)}`, null);
        game = resp.game || { moves: [], status: 'active' };
        board.classList.remove('cb-static');
        updateUI();
        if (!myTurn()) schedulePoll();
      } catch (e) {
        exhibition();
      }
    })();
  }
});
