/* ================================================================
   LoLa's Supper Club — Up and Down the River
   Full trick-taking card game
   ================================================================ */

// ---- Constants ----

const SUITS      = ['♠', '♥', '♦', '♣'];
const RANKS      = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const RANK_VAL   = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };
const SUIT_COLOR = { '♠':'black-suit','♣':'black-suit','♥':'red-suit','♦':'red-suit' };
const SUIT_NAME  = { '♠':'Spades','♥':'Hearts','♦':'Diamonds','♣':'Clubs' };

// ---- Game state ----

let G = null;

// ---- Deck helpers ----

function buildDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  return d;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Card value for trick comparison ----

function cardStrength(card, ledSuit, trumpSuit) {
  let v = RANK_VAL[card.rank];
  if (card.suit === trumpSuit) v += 100;
  else if (card.suit === ledSuit) v += 50;
  else v = 0; // can't win
  return v;
}

function trickWinner(trick, ledSuit, trumpSuit) {
  let best = 0;
  let bestVal = cardStrength(trick[0].card, ledSuit, trumpSuit);
  for (let i = 1; i < trick.length; i++) {
    const v = cardStrength(trick[i].card, ledSuit, trumpSuit);
    if (v > bestVal) { bestVal = v; best = i; }
  }
  return best;
}

// ================================================================
//  INIT & ROUND
// ================================================================

function initGame() {
  const rows    = document.querySelectorAll('.player-row');
  const names   = Array.from(rows).map(r => r.querySelector('.player-input').value.trim()).filter(Boolean);

  if (names.length < 2) { alert('Add at least 2 players!'); return; }

  const maxCards = Math.min(7, Math.floor(52 / names.length));
  const rounds   = [];
  for (let i = 1; i <= maxCards; i++) rounds.push(i);
  for (let i = maxCards - 1; i >= 1; i--) rounds.push(i);

  G = {
    players:         names.map((name, i) => ({ name, hand: [], bid: null, tricks: 0, score: 0, isHuman: i === 0 })),
    rounds,
    roundIdx:        0,
    dealer:          0,
    phase:           null,   // 'bidding' | 'playing' | 'round-end' | 'game-over'
    trumpCard:       null,
    trumpSuit:       null,
    currentTrick:    [],
    currentPlayer:   0,
    ledSuit:         null,
    bidsIn:          0,
  };

  document.querySelector('.game-setup').style.display = 'none';
  document.querySelector('.game-play').style.display  = 'block';

  startRound();
}

function startRound() {
  const n    = G.rounds[G.roundIdx];
  const deck = shuffle(buildDeck());

  G.players.forEach(p => { p.hand = []; p.bid = null; p.tricks = 0; });

  for (let c = 0; c < n; c++) G.players.forEach(p => p.hand.push(deck.pop()));

  G.trumpCard = deck.length > 0 ? deck.pop() : null;
  G.trumpSuit = G.trumpCard ? G.trumpCard.suit : null;

  G.currentTrick  = [];
  G.ledSuit       = null;
  G.bidsIn        = 0;
  G.phase         = 'bidding';
  G.currentPlayer = (G.dealer + 1) % G.players.length;

  render();
  if (!G.players[G.currentPlayer].isHuman) setTimeout(aiDoBid, 700);
}

// ================================================================
//  BIDDING
// ================================================================

function forbiddenBid() {
  // Last bidder (dealer) may not bid the amount that makes total == round card count
  const isLast    = G.bidsIn === G.players.length - 1;
  const total     = G.players.reduce((s, p) => s + (p.bid !== null ? p.bid : 0), 0);
  return isLast ? G.rounds[G.roundIdx] - total : -1;
}

function submitBid(bid) {
  if (G.phase !== 'bidding') return;
  const p = G.players[G.currentPlayer];
  if (!p.isHuman) return;
  applyBid(bid);
}

function applyBid(bid) {
  G.players[G.currentPlayer].bid = bid;
  G.bidsIn++;
  advanceAfterBid();
}

function advanceAfterBid() {
  if (G.bidsIn >= G.players.length) {
    G.phase         = 'playing';
    G.currentPlayer = (G.dealer + 1) % G.players.length;
    render();
    if (!G.players[G.currentPlayer].isHuman) setTimeout(aiDoPlay, 800);
    return;
  }
  G.currentPlayer = (G.currentPlayer + 1) % G.players.length;
  render();
  if (!G.players[G.currentPlayer].isHuman) setTimeout(aiDoBid, 650);
}

function aiDoBid() {
  if (G.phase !== 'bidding') return;
  const p = G.players[G.currentPlayer];
  if (p.isHuman) return;

  const n   = G.rounds[G.roundIdx];
  let bid = 0;
  p.hand.forEach(c => {
    if (c.suit === G.trumpSuit)                        bid += 0.75;
    if (c.rank === 'A')                                bid += 0.7;
    if (c.rank === 'K')                                bid += 0.4;
    if (c.rank === 'Q')                                bid += 0.2;
  });
  bid = Math.min(Math.round(bid), n);

  const forbidden = forbiddenBid();
  if (bid === forbidden) {
    bid = (bid > 0) ? bid - 1 : bid + 1;
    bid = Math.max(0, Math.min(bid, n));
  }

  applyBid(bid);
}

// ================================================================
//  PLAYING
// ================================================================

function humanPlayCard(idx) {
  if (G.phase !== 'playing') return;
  const p = G.players[G.currentPlayer];
  if (!p.isHuman) return;

  const card = p.hand[idx];
  if (!canPlay(p, card)) {
    // Flash the card to indicate invalid
    const el = document.querySelectorAll('.card[data-idx]');
    if (el[idx]) {
      el[idx].style.outline = '2px solid var(--red)';
      setTimeout(() => { if (el[idx]) el[idx].style.outline = ''; }, 600);
    }
    return;
  }
  doPlay(G.currentPlayer, card);
}

function canPlay(player, card) {
  if (!G.ledSuit) return true;
  const hasSuit = player.hand.some(c => c.suit === G.ledSuit);
  return !hasSuit || card.suit === G.ledSuit;
}

function doPlay(playerIdx, card) {
  const p   = G.players[playerIdx];
  const idx = p.hand.indexOf(card);
  p.hand.splice(idx, 1);

  if (G.currentTrick.length === 0) G.ledSuit = card.suit;
  G.currentTrick.push({ playerIdx, card });

  if (G.currentTrick.length === G.players.length) {
    render();
    setTimeout(resolveTrick, 1100);
    return;
  }

  G.currentPlayer = (G.currentPlayer + 1) % G.players.length;
  render();
  if (!G.players[G.currentPlayer].isHuman) setTimeout(aiDoPlay, 700);
}

function aiDoPlay() {
  if (G.phase !== 'playing') return;
  const p = G.players[G.currentPlayer];
  if (p.isHuman) return;

  const followable = G.ledSuit ? p.hand.filter(c => c.suit === G.ledSuit) : [];
  const trumps     = p.hand.filter(c => c.suit === G.trumpSuit);
  const pool       = followable.length > 0 ? followable : p.hand;

  let pick;
  if (G.currentTrick.length === 0) {
    // Leading: play highest card in hand
    pick = pool.reduce((b, c) => RANK_VAL[c.rank] > RANK_VAL[b.rank] ? c : b);
  } else if (followable.length > 0) {
    // Must follow: play highest of that suit
    pick = followable.reduce((b, c) => RANK_VAL[c.rank] > RANK_VAL[b.rank] ? c : b);
  } else if (trumps.length > 0) {
    // Ruff with lowest trump
    pick = trumps.reduce((b, c) => RANK_VAL[c.rank] < RANK_VAL[b.rank] ? c : b);
  } else {
    // Throw away lowest card
    pick = pool.reduce((b, c) => RANK_VAL[c.rank] < RANK_VAL[b.rank] ? c : b);
  }

  doPlay(G.currentPlayer, pick);
}

function resolveTrick() {
  const winIdx        = trickWinner(G.currentTrick, G.ledSuit, G.trumpSuit);
  const winner        = G.currentTrick[winIdx];
  G.players[winner.playerIdx].tricks++;

  G.currentTrick  = [];
  G.ledSuit       = null;
  G.currentPlayer = winner.playerIdx;

  // Round over when hands are empty
  if (G.players.every(p => p.hand.length === 0)) {
    endRound();
    return;
  }

  render();
  if (!G.players[G.currentPlayer].isHuman) setTimeout(aiDoPlay, 700);
}

// ================================================================
//  SCORING
// ================================================================

function endRound() {
  G.phase = 'round-end';
  G.players.forEach(p => {
    if (p.bid === p.tricks) {
      p.score += 10 + p.bid;
    } else {
      p.score -= Math.abs(p.bid - p.tricks) * 5;
    }
  });

  G.roundIdx++;
  G.dealer = (G.dealer + 1) % G.players.length;
  if (G.roundIdx >= G.rounds.length) G.phase = 'game-over';

  render();
}

function nextRound() {
  if (G.phase === 'game-over') return;
  startRound();
}

function resetGame() {
  G = null;
  const container = document.getElementById('game-container');
  renderSetup(container);
  document.querySelector('.game-setup').style.display = 'block';
  document.querySelector('.game-play').style.display  = 'none';
  document.querySelector('.game-play').innerHTML      = '';
}

// ================================================================
//  RENDER
// ================================================================

function cardHTML(card, idx, clickable, disabled) {
  const color   = SUIT_COLOR[card.suit];
  const classes = ['card', color, clickable ? '' : 'card--played', disabled ? 'card--disabled' : ''].join(' ');
  const handler = clickable && !disabled ? `onclick="humanPlayCard(${idx})"` : '';
  return `<div class="${classes}" data-idx="${idx}" ${handler}>
    <div class="card-rank">${card.rank}</div>
    <div class="card-suit">${card.suit}</div>
  </div>`;
}

function trumpPillHTML() {
  if (!G.trumpCard) {
    return `<div class="trump-pill"><span class="trump-label">No Trump this round</span></div>`;
  }
  const color = SUIT_COLOR[G.trumpSuit];
  return `<div class="trump-pill">
    <span class="trump-label">Trump</span>
    <span class="trump-card-badge ${color}">${G.trumpCard.rank}${G.trumpSuit}</span>
    <span class="trump-suit-name">${SUIT_NAME[G.trumpSuit]}</span>
  </div>`;
}

function scoreboardHTML() {
  const total   = G.rounds.length;
  const current = G.roundIdx < total ? G.roundIdx + 1 : total;
  const cards   = G.rounds[Math.min(G.roundIdx, total - 1)];
  const badge   = G.phase === 'game-over'
    ? 'Game Over'
    : `Round ${current} of ${total} &mdash; ${cards} card${cards !== 1 ? 's' : ''}`;

  let rows = G.players.map((p, i) => {
    const isCur = i === G.currentPlayer && G.phase !== 'game-over' && G.phase !== 'round-end';
    return `<tr>
      <td class="col-name${isCur ? ' col-current' : ''}">${p.name}${isCur ? ' &#9664;' : ''}</td>
      <td>${p.bid !== null ? p.bid : '&mdash;'}</td>
      <td>${p.tricks}</td>
      <td class="col-score">${p.score >= 0 ? '' : ''}${p.score}</td>
    </tr>`;
  }).join('');

  return `<div class="game-scoreboard">
    <div class="scoreboard-header">
      <span class="scoreboard-title">Scoreboard</span>
      <span class="round-badge">${badge}</span>
    </div>
    <table class="score-table">
      <thead><tr>
        <th>Player</th><th>Bid</th><th>Tricks</th><th>Score</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function render() {
  if (!G) return;
  const play = document.querySelector('.game-play');
  if (!play) return;

  let html = scoreboardHTML();

  if (G.phase === 'game-over') {
    const winner = G.players.reduce((w, p) => p.score > w.score ? p : w);
    html += `<div class="game-phase-panel">
      <div class="game-over-panel">
        <div class="game-over-title">That's a Wrap.</div>
        <div class="game-over-winner">&#127754; ${winner.name} wins with ${winner.score} points</div>
        <div style="margin-bottom:1.5rem;">
          ${G.players.sort((a,b)=>b.score-a.score).map((p,i)=>`
            <div class="round-result-row">
              <span class="result-name">${i===0?'&#129351; ':''}${p.name}</span>
              <span style="color:var(--text-dim);font-size:0.82rem;">${p.score} pts</span>
            </div>`).join('')}
        </div>
        <div class="game-footer-actions" style="justify-content:center;">
          <button class="btn btn--primary" onclick="resetGame()">Play Again</button>
        </div>
      </div>
    </div>`;

  } else if (G.phase === 'round-end') {
    const next = G.rounds[G.roundIdx];
    const resultRows = G.players.map(p => {
      const hit = p.bid === p.tricks;
      return `<div class="round-result-row">
        <span class="result-name">${p.name}</span>
        <span>bid <strong style="color:var(--text)">${p.bid}</strong>, got <strong style="color:var(--text)">${p.tricks}</strong></span>
        <span class="${hit ? 'result-hit' : 'result-miss'}">${hit ? `+${10+p.bid} pts ✓` : `${-(Math.abs(p.bid-p.tricks)*5)} pts`}</span>
      </div>`;
    }).join('');

    html += `<div class="game-phase-panel">
      <div class="phase-heading">Round Over</div>
      <div class="round-result" style="margin-bottom:1.5rem;">${resultRows}</div>
      <div class="game-footer-actions">
        <button class="btn btn--primary" onclick="nextRound()">
          Next Round &rarr; ${next} card${next !== 1 ? 's' : ''}
        </button>
        <button class="btn btn--ghost" onclick="resetGame()">New Game</button>
      </div>
    </div>`;

  } else if (G.phase === 'bidding') {
    const cur = G.players[G.currentPlayer];
    const n   = G.rounds[G.roundIdx];
    const forbidden = forbiddenBid();

    let phaseBody = `<div class="phase-heading">Bidding</div>`;
    phaseBody += trumpPillHTML();

    if (cur.isHuman) {
      // Show hand during bidding so player can assess
      phaseBody += `<div class="hand-section">
        <span class="hand-label">Your Hand</span>
        <div class="cards-row">
          ${cur.hand.map(c => cardHTML(c, 0, false, false)).join('')}
        </div>
      </div>`;

      // Bid buttons
      let btns = '';
      for (let b = 0; b <= n; b++) {
        const dis = b === forbidden;
        btns += `<button class="bid-btn" onclick="submitBid(${b})" ${dis ? 'disabled title="Cannot bid — would set total equal to card count"' : ''}>${b}</button>`;
      }

      phaseBody += `<div class="bid-row">
        <span class="bid-prompt">How many tricks, <strong>${cur.name}</strong>?</span>
        <div class="bid-btns">${btns}</div>
      </div>`;
      if (forbidden >= 0) {
        phaseBody += `<p class="no-bust-note">* You may not bid ${forbidden} (dealer's no-bust rule)</p>`;
      }
    } else {
      phaseBody += `<div class="phase-info">Waiting for <strong>${cur.name}</strong> to bid&hellip;</div>`;
    }

    html += `<div class="game-phase-panel">${phaseBody}</div>`;

  } else if (G.phase === 'playing') {
    const cur = G.players[G.currentPlayer];
    const n   = G.rounds[G.roundIdx];
    const trickNum = n - G.players[0].hand.length + (G.currentTrick.length > 0 ? 1 : 0);

    let phaseBody = `<div class="phase-heading">Play</div>`;
    phaseBody += `<div class="phase-info">Trick ${trickNum} of ${n}${cur.isHuman ? '' : ` &mdash; waiting for <strong>${cur.name}</strong>&hellip;`}</div>`;
    phaseBody += trumpPillHTML();

    // Current trick
    if (G.currentTrick.length > 0 || true) {
      const slots = G.currentTrick.map(t => `
        <div class="trick-slot">
          <span class="trick-slot-name">${G.players[t.playerIdx].name}</span>
          ${cardHTML(t.card, 0, false, false)}
        </div>`).join('');
      phaseBody += `<span class="hand-label">Current Trick</span>
        <div class="trick-area">${slots || '<span style="color:var(--text-dim);font-size:0.8rem;">Waiting for first card&hellip;</span>'}</div>`;
    }

    // Human hand — only clickable on human's turn
    if (G.players.some(p => p.isHuman)) {
      const humanPlayer = G.players.find(p => p.isHuman);
      const isMyTurn = G.players[G.currentPlayer].isHuman;

      phaseBody += `<div class="hand-section">
        <span class="hand-label">${isMyTurn ? 'Your Hand — click a card to play' : 'Your Hand'}</span>
        <div class="cards-row">
          ${humanPlayer.hand.map((c, i) => {
            const disabled = !isMyTurn || !canPlay(humanPlayer, c);
            return cardHTML(c, i, isMyTurn, disabled);
          }).join('')}
        </div>
      </div>`;
    }

    html += `<div class="game-phase-panel">${phaseBody}</div>`;
  }

  // New game button
  html += `<div class="game-footer-actions">
    <button class="btn btn--ghost" onclick="resetGame()" style="font-size:0.65rem;">&#8617; New Game</button>
  </div>`;

  play.innerHTML = html;
}

// ================================================================
//  SETUP FORM
// ================================================================

function renderSetup(container) {
  container.innerHTML = `
    <div class="game-setup">
      <h3 class="game-setup-title">How to Play</h3>
      <p class="game-rules-text">
        Each round, everyone is dealt a set number of cards &mdash; starting at 1, climbing to a max, then back down to 1.
        Before any cards are played, you bid how many tricks you think you'll win. Hit your exact bid and you score
        <strong>10 + your bid</strong>. Miss by any amount and you lose <strong>5 points per trick off</strong>.
        <br><br>
        <strong>The catch:</strong> the dealer cannot bid the number that would make total bids equal the card count.
        Someone is always set up to fail. That's the whole point.
      </p>

      <span class="field-label">Players (2&ndash;7) &mdash; you play first</span>
      <div class="player-rows" id="player-rows">
        <div class="player-row">
          <input class="player-input" type="text" placeholder="Your name" maxlength="18">
        </div>
        <div class="player-row">
          <input class="player-input" type="text" placeholder="Player 2" maxlength="18">
          <button class="remove-player" onclick="removePlayer(this)" title="Remove">&#8722;</button>
        </div>
        <div class="player-row">
          <input class="player-input" type="text" placeholder="Player 3" maxlength="18">
          <button class="remove-player" onclick="removePlayer(this)" title="Remove">&#8722;</button>
        </div>
      </div>
      <button class="add-player-btn" id="add-player-btn" onclick="addPlayer()">+ Add Player</button>

      <button class="btn btn--primary deal-btn" onclick="initGame()">Deal Cards &rarr;</button>
    </div>

    <div class="game-play" style="display:none;"></div>
  `;
}

function addPlayer() {
  const rows = document.getElementById('player-rows');
  const count = rows.querySelectorAll('.player-row').length;
  if (count >= 7) return;

  const row = document.createElement('div');
  row.className = 'player-row';
  row.innerHTML = `
    <input class="player-input" type="text" placeholder="Player ${count + 1}" maxlength="18">
    <button class="remove-player" onclick="removePlayer(this)" title="Remove">&#8722;</button>
  `;
  rows.appendChild(row);

  if (count + 1 >= 7) document.getElementById('add-player-btn').style.display = 'none';
}

function removePlayer(btn) {
  const rows = document.getElementById('player-rows');
  if (rows.querySelectorAll('.player-row').length <= 2) return;
  btn.closest('.player-row').remove();
  document.getElementById('add-player-btn').style.display = 'block';
}

// ---- Init on load ----

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (container) renderSetup(container);
});
