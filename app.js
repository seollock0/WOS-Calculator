/*************************************************
 * WOS 전투 최적화 계산기 – Client Only (최종)
 * - 서버 없음
 * - heroes.json 확장 구조 100% 반영
 *************************************************/

const BRANCHES = ["shield", "spear", "archer"];
let HEROES = {};
let chart = null;

/* ------------------------------
 * utils
 * ------------------------------ */
function num(id) {
  return Number(document.getElementById(id).value || 0);
}

/* ------------------------------
 * heroes.json 로드 & 드롭다운
 * ------------------------------ */
async function loadHeroes() {
  HEROES = await (await fetch("heroes.json")).json();

  BRANCHES.forEach(b => {
    fillDropdown(`our_${b}_hero`, b);
    fillDropdown(`enemy_${b}_hero`, b);
  });
}

function fillDropdown(id, branch) {
  const sel = document.getElementById(id);
  sel.innerHTML = "";
  Object.keys(HEROES[branch]).forEach(hero => {
    sel.append(new Option(hero, hero));
  });
}

/* ------------------------------
 * 영웅 계수 계산 (확장 스킬 반영)
 * ------------------------------ */
function calcAttackMultiplier(skills, branch, enemyBranch, enemyIsDefense) {
  let atk = 1.0;

  // 기본 공격/피해 증가
  atk += skills.attack_pct || 0;
  atk *= 1 + (skills.damage_pct || 0);
  atk *= 1 + (skills.global_damage_pct || 0);
  atk *= 1 + (skills.target_damage_pct || 0);

  // 병종 특화 피해
  if (enemyBranch === "shield") atk *= 1 + (skills.vs_shield_damage_pct || 0);
  if (enemyBranch === "spear")  atk *= 1 + (skills.vs_spear_damage_pct  || 0);
  if (enemyBranch === "archer") atk *= 1 + (skills.vs_archer_damage_pct || 0);

  // 발동형 스킬 (기대값)
  if (skills.damage_proc) {
    const p = skills.damage_proc;
    atk *= 1 + (p.chance * p.effect * p.uptime);
  }

  // 추가 공격 계열
  if (skills.extra_hit_proc) {
    const p = skills.extra_hit_proc;
    atk *= 1 + (p.effect * p.uptime);
  }

  // 전용 무기 – 수성 한정
  if (enemyIsDefense && skills.exclusive_weapon) {
    atk *= 1 + (skills.exclusive_weapon.defense_only_attack_pct || 0);
  }

  return atk;
}

function calcSurviveMultiplier(skills, enemyIsDefense) {
  let s = 1.0;

  // HP 증가
  s += skills.hp_pct || 0;

  // 피해 감소
  s *= 1 + (skills.damage_reduce_pct || 0);

  // 상태 이상/조건부 피해 감소
  if (skills.global_damage_reduce_pct) {
    const p = skills.global_damage_reduce_pct;
    s *= 1 + (p.chance * p.effect);
  }

  // 수성 전용 무기
  if (enemyIsDefense && skills.exclusive_weapon) {
    s *= 1 + (skills.exclusive_weapon.defense_only_hp_pct || 0);
  }

  return s;
}

/* ------------------------------
 * 전투 점수 계산
 * ------------------------------ */
function battleScore(ratio, our, enemy, enemyIsDefense) {
  let atk1 = 0, hp1 = 0, atk2 = 0, hp2 = 0;

  BRANCHES.forEach(b => {
    atk1 += ratio[b] * our.atk[b];
    hp1  += ratio[b] * our.hp[b];
    atk2 += ratio[b] * enemy.atk[b];
    hp2  += ratio[b] * enemy.hp[b];
  });

  let score = (atk1 / hp1) / (atk2 / hp2);
  if (enemyIsDefense) score /= 1.15;

  return score;
}

/* ------------------------------
 * 최적화 (1% 탐색)
 * ------------------------------ */
function optimize(input) {
  let best = { score: 0 };

  for (let r = 0; r <= 1; r += 0.01) {
    for (let s = 0; s <= 1 - r; s += 0.01) {
      const a = 1 - r - s;
      const ratio = { shield: r, spear: s, archer: a };
      const sc = battleScore(ratio, input.our, input.enemy, input.enemyIsDefense);
      if (sc > best.score) best = { score: sc, ratio };
    }
  }
  return best;
}

/* ------------------------------
 * UI 이벤트
 * ------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  await loadHeroes();

  document.getElementById("calcBtn").onclick = () => {

    const enemyIsDefense = document.getElementById("enemyDefense").checked;

    const our = { atk:{}, hp:{} };
    const enemy = { atk:{}, hp:{} };

    BRANCHES.forEach(b => {
      const oh = document.getElementById(`our_${b}_hero`).value;
      const eh = document.getElementById(`enemy_${b}_hero`).value;

      const ourSkills = HEROES[b][oh].skills;
      const enemySkills = HEROES[b][eh].skills;

      our.atk[b] =
        num(`our_${b}_atk`) *
        calcAttackMultiplier(ourSkills, b, b, enemyIsDefense);

      our.hp[b] =
        num(`our_${b}_hp`) *
        calcSurviveMultiplier(ourSkills, enemyIsDefense);

      enemy.atk[b] =
        num(`enemy_${b}_atk`) *
        calcAttackMultiplier(enemySkills, b, b, enemyIsDefense);

      enemy.hp[b] =
        num(`enemy_${b}_hp`) *
        calcSurviveMultiplier(enemySkills, enemyIsDefense);
    });

    const res = optimize({ our, enemy, enemyIsDefense });

    document.getElementById("resultBox").hidden = false;
    document.getElementById("resultText").innerText =
      `최적 병종 비율
방패 ${(res.ratio.shield*100).toFixed(1)}%
창 ${(res.ratio.spear*100).toFixed(1)}%
궁 ${(res.ratio.archer*100).toFixed(1)}%
점수 ${res.score.toFixed(2)}`;

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("ratioChart"), {
      type: "doughnut",
      data: {
        labels: ["방패", "창", "궁"],
        datasets: [{
          data: [
            res.ratio.shield*100,
            res.ratio.spear*100,
            res.ratio.archer*100
          ]
        }]
      }
    });
  };
});
