/* One local, shared record for every word game on this origin.
 * Streaks count consecutive local calendar days with at least one win.
 * Extra wins on the same day never inflate a streak.
 */
(function () {
  'use strict';
  const KEY = 'anrat.wordgames.stats.v1';
  const GAMES = {
    crossword: 'Crossword', wordle: 'Wordle Unlimited', connections: 'Connections',
    wordsearch: 'Word Search', wordwheel: 'Word Wheel', layers: 'Layers'
  };
  const empty = () => ({ played: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, lastWinDay: null, totalSeconds: 0 });
  const number = value => Math.max(0, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0);
  const day = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const dayDistance = (a, b) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a || '') || !/^\d{4}-\d{2}-\d{2}$/.test(b || '')) return Infinity;
    return Math.round((Date.parse(a + 'T12:00:00') - Date.parse(b + 'T12:00:00')) / 86400000);
  };
  const normalize = raw => {
    const out = empty();
    if (!raw || typeof raw !== 'object') return out;
    for (const field of ['played', 'wins', 'streak', 'bestStreak', 'totalSeconds']) out[field] = number(raw[field]);
    out.wins = Math.min(out.wins, out.played);
    out.losses = out.played - out.wins;
    out.lastWinDay = /^\d{4}-\d{2}-\d{2}$/.test(raw.lastWinDay || '') ? raw.lastWinDay : null;
    out.bestStreak = Math.max(out.bestStreak, out.streak);
    return out;
  };
  let volatile = null;
  function load() {
    if (volatile) return volatile;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch { /* storage unavailable */ }
    if (!saved || typeof saved !== 'object' || !saved.games) {
      saved = { games: {}, overall: empty() };
      // Preserve any existing Layers numbers when moving to the shared scoreboard.
      try {
        const old = JSON.parse(localStorage.getItem('anrat.layers.stats.v2'));
        if (old && typeof old === 'object') {
          const migrated = normalize({ ...old, lastWinDay: old.lastDay });
          saved.games.layers = migrated;
          saved.overall = { ...migrated };
        }
      } catch { /* no legacy stats */ }
      persist(saved);
    }
    return saved;
  }
  function persist(value) {
    volatile = value;
    try { localStorage.setItem(KEY, JSON.stringify(value)); volatile = null; } catch { /* work in memory if storage is blocked */ }
  }
  function currentStreak(stat) {
    const gap = dayDistance(day(), stat.lastWinDay);
    return gap === 0 || gap === 1 ? stat.streak : 0;
  }
  function read(id) {
    const data = load();
    const stat = normalize(id === 'overall' ? data.overall : data.games?.[id]);
    stat.streak = currentStreak(stat);
    stat.winRate = stat.played ? Math.round(stat.wins * 100 / stat.played) : 0;
    return stat;
  }
  function addResult(stat, won, seconds) {
    stat.played++;
    if (won) {
      stat.wins++;
      const today = day();
      if (stat.lastWinDay !== today) {
        stat.streak = dayDistance(today, stat.lastWinDay) === 1 ? stat.streak + 1 : 1;
        stat.lastWinDay = today;
      }
      stat.bestStreak = Math.max(stat.bestStreak, stat.streak);
    }
    stat.losses = stat.played - stat.wins;
    stat.totalSeconds += number(seconds);
  }
  function record(id, won, seconds = 0) {
    if (!Object.hasOwn(GAMES, id)) return;
    const data = load();
    data.games ||= {};
    data.games[id] = normalize(data.games[id]);
    data.overall = normalize(data.overall);
    addResult(data.games[id], Boolean(won), seconds);
    addResult(data.overall, Boolean(won), seconds);
    persist(data);
    window.dispatchEvent(new CustomEvent('wordgames:stats-changed', { detail: { id } }));
  }
  function mount(id, anchor) {
    if (!Object.hasOwn(GAMES, id)) return;
    const insert = () => {
      if (document.querySelector('.wordgames-history')) return;
      const root = typeof anchor === 'string' ? document.querySelector(anchor) : anchor;
      if (!root) return;
      if (!document.querySelector('#wordgames-history-style')) {
        const css = document.createElement('style');
        css.id = 'wordgames-history-style';
        css.textContent = `
          .wordgames-history{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:13px 0 20px;color:#e9dff3;font-family:ui-monospace,"Cascadia Code",Consolas,monospace;}
          .wordgames-history>div{padding:10px 9px;border:1px solid #715584;border-radius:9px;background:#291e35;min-width:0;}
          .wordgames-history small{display:block;color:#c3accf;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}
          .wordgames-history strong{display:block;margin-top:5px;color:#dcadff;font-size:clamp(15px,2.8vw,21px);line-height:1.2;}
          @media(max-width:520px){.wordgames-history{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:8px 0 12px}.wordgames-history>div{padding:7px 6px}.wordgames-history small{font-size:8px}.wordgames-history strong{font-size:15px}}
        `;
        document.head.append(css);
      }
      const bar = document.createElement('section');
      bar.className = 'wordgames-history';
      bar.setAttribute('aria-label', GAMES[id] + ' saved all-time stats');
      const fields = [['played', 'Played'], ['wins', 'Wins'], ['winRate', 'Win rate', '%'], ['streak', 'Day streak'], ['bestStreak', 'Best streak']];
      const nodes = fields.map(([field, label]) => {
        const item = document.createElement('div');
        const caption = document.createElement('small'); caption.textContent = label;
        const value = document.createElement('strong');
        item.append(caption, value); bar.append(item);
        return { field, value };
      });
      root.insertAdjacentElement('afterend', bar);
      const render = () => { const stats = read(id); for (const node of nodes) node.value.textContent = stats[node.field] + (node.field === 'winRate' ? '%' : ''); };
      render();
      window.addEventListener('wordgames:stats-changed', render);
      window.addEventListener('storage', render);
      window.addEventListener('focus', render);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', insert, { once: true });
    else insert();
  }
  window.GameStats = Object.freeze({ GAMES, read, record, mount });
})();
