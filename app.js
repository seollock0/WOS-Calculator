/*************************************************
 *  WOS 전투 최적화 계산기 (Client-Only)
 *  - 서버 없음
 *  - GitHub Pages에서 바로 동작
 *************************************************/

const BRANCHES = ["shield", "spear", "archer"];
let HEROES = {}; // heroes.json 로드됨

/*************************************************
 * 1. heroes.json 로드 + 드롭다운 세팅
 *************************************************/
async function loadHeroes() {
  const res = await fetch("heroes.json");
  HEROES = await res.json();

  fillHeroDropdown("our_shield_hero", "shield");
  fillHeroDropdown("our_spear_hero", "spear");
  fillHeroDropdown("our_archer_hero", "archer");
}

function fillHeroDropdown(selectId, branch) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = "";

  Object.keys(HEROES[branch]).forEach(hero => {
    const opt = document.createElement("option");
    opt.value = hero;
    opt.textContent = hero;
    sel.appendChild(opt);
  });
}

/*************************************************
 * 2. 영웅 계수 계산 (heroes.py 포팅)
 *************************************************/
function calcAttackMultiplier(skills) {
  let atk = 1.0;

  atk += skills.attack_pct || 0;
  atk *= 1 + (skills.damage_pct || 0);
  atk *= 1 + (skills.target_damage_pct || 0);
  atk *= 1 + (skills.global_damage_pct || 0);

  if (skills.damage_proc) {
    const p = skills.damage_proc;
    const expected = (p.chance || 0) * (p.effect || 0) * (p.uptime || 0);
    atk *= 1 + expected;
  }
  return atk;
}

function calcSurviveMultiplier(skills) {
  let s = 1.0;
  s += skills.hp_pct || 0;
  s *= 1 + (skills.damage_reduce_pct || 0);
  return s;
}

/*************************************************
 * 3. 전투 점수 계산 (battle.py 포팅)
 *************************************************/
function battleScore(ratio, heroMult, totalSoldiers, enemyIsDefense) {
  let atkSum = 0, survSum = 0;

  BRANCHES.forEach(b => {
    atkSum += ratio[b] * heroMult[b].attack;
    survSum += ratio[b] * heroMult[b].survive;
  });

  let score = Math.sqrt(totalSoldiers) * atkSum / survSum;

  if (enemyIsDefense) score /= 1.15;
  return score;
}

/*************************************************
 * 4. 최적 조합 탐색 (optimizer.py 포팅)
 *    - 영웅 자동 탐색
 *    - 비율 1% 고정
 *************************************************/
function optimize(totalSoldiers, enemyIsDefense) {
  let best = { score: 0 };

  const sh = Object.keys(HEROES.shield);
  const sp = Object.keys(HEROES.spear);
  const ar = Object.keys(HEROES.archer);

  for (const h1 of sh)
  for (const h2 of sp)
  for (const h3 of ar) {

    const heroMult = {
      shield: {
        attack: calcAttackMultiplier(HEROES.shield[h1].skills),
        survive: calcSurviveMultiplier(HEROES.shield[h1].skills)
      },
      spear: {
        attack: calcAttackMultiplier(HEROES.spear[h2].skills),
        survive: calcSurviveMultiplier(HEROES.spear[h2].skills)
      },
      archer: {
        attack: calcAttackMultiplier(HEROES.archer[h3].skills),
        survive: calcSurviveMultiplier(HEROES.archer[h3].skills)
      }
    };

    for (let r = 0; r <= 1; r += 0.01) {
      for (let s = 0; s <= 1 - r; s += 0.01) {
        const a = 1 - r - s;

        const ratio = { shield: r, spear: s, archer: a };
        const score = battleScore(ratio, heroMult, totalSoldiers, enemyIsDefense);

        if (score > best.score) {
          best = {
            score,
            ratio,
            heroes: { shield: h1, spear: h2, archer: h3 }
          };
        }
      }
    }
  }
  return best;
}

/*************************************************
 * 5. UI 이벤트
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  loadHeroes();

  document.getElementById("calcBtn").onclick = () => {
    const total = Number(document.getElementById("our_total_count").value);
    const enemyDef = document.getElementById("enemyDefense").checked;

    if (!total || total <= 0) {
      alert("총 병사 수를 입력하세요.");
      return;
    }

    const result = optimize(total, enemyDef);
    renderResult(result, total);
  };
});

/*************************************************
 * 6. 결과 출력
 *************************************************/
function renderResult(res, total) {
  document.getElementById("resultBox").hidden = false;

  document.getElementById("resultHeroes").innerText =
    `영웅 조합\n방패: ${res.heroes.shield}\n창: ${res.heroes.spear}\n궁: ${res.heroes.archer}`;

  document.getElementById("resultRatio").innerText =
    `병종 비율\n방패 ${(res.ratio.shield*100).toFixed(1)}%\n` +
    `창 ${(res.ratio.spear*100).toFixed(1)}%\n` +
    `궁 ${(res.ratio.archer*100).toFixed(1)}%`;

  document.getElementById("resultCounts").innerText =
    `병종별 병사 수\n방패 ${Math.round(total*res.ratio.shield)}\n` +
    `창 ${Math.round(total*res.ratio.spear)}\n` +
    `궁 ${Math.round(total*res.ratio.archer)}`;

  const verdict = res.score >= 1.05 ? "여유 승" :
                  res.score >= 0.95 ? "박빙" : "불리";

  document.getElementById("resultVerdict").innerText =
    `판정: ${verdict} (지표 ${res.score.toFixed(2)})`;

  document.getElementById("resultSummary").innerText =
    `추천: 방패 ${(res.ratio.shield*100).toFixed(1)}% / `
    + `창 ${(res.ratio.spear*100).toFixed(1)}% / `
    + `궁 ${(res.ratio.archer*100).toFixed(1)}% (${verdict})`;
}
