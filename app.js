const BRANCHES = ["shield", "spear", "archer"];
let HEROES = {};
let chart = null;

function num(id) {
  return Number(document.getElementById(id).value || 0);
}

async function loadHeroes() {
  HEROES = await (await fetch("heroes.json")).json();
  BRANCHES.forEach(b => {
    fill(`our_${b}_hero`, b);
    fill(`enemy_${b}_hero`, b);
  });
}

function fill(id, b) {
  const s = document.getElementById(id);
  Object.keys(HEROES[b]).forEach(h => s.append(new Option(h, h)));
}

/* 영웅 계수 */
function attackMultiplier(sk) {
  let v = 1 + (sk.attack_pct || 0);
  v *= 1 + (sk.damage_pct || 0);
  v *= 1 + (sk.global_damage_pct || 0);
  if (sk.damage_proc) {
    const p = sk.damage_proc;
    v *= 1 + p.chance * p.effect * p.uptime;
  }
  return v;
}

function surviveMultiplier(sk) {
  let v = 1 + (sk.hp_pct || 0);
  v *= 1 + (sk.damage_reduce_pct || 0);
  return v;
}

/* 핵심 전투 점수 */
function score(ratio, our, enemy, enemyDefense) {
  let atk1 = 0, def1 = 0, atk2 = 0, def2 = 0;

  BRANCHES.forEach(b => {
    atk1 += ratio[b] * our.attack[b];
    def1 += ratio[b] * our.survive[b];
    atk2 += ratio[b] * enemy.attack[b];
    def2 += ratio[b] * enemy.survive[b];
  });

  let s = (atk1 / def1) / (atk2 / def2);
  if (enemyDefense) s /= 1.15;
  return s;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeroes();

  document.getElementById("calcBtn").onclick = () => {
    const enemyDefense = document.getElementById("enemyDefense").checked;

    const our = { attack: {}, survive: {} };
    const enemy = { attack: {}, survive: {} };

    BRANCHES.forEach(b => {
      const oh = HEROES[b][document.getElementById(`our_${b}_hero`).value].skills;
      const eh = HEROES[b][document.getElementById(`enemy_${b}_hero`).value].skills;

      const ourAtk = num(`our_${b}_atk`) * num(`our_${b}_pow`);
      const ourDef = num(`our_${b}_def`) * num(`our_${b}_hp`);

      const enAtk  = num(`enemy_${b}_atk`) * num(`enemy_${b}_pow`);
      const enDef  = num(`enemy_${b}_def`) * num(`enemy_${b}_hp`);

      our.attack[b]  = ourAtk * attackMultiplier(oh);
      our.survive[b] = ourDef * surviveMultiplier(oh);

      enemy.attack[b]  = enAtk * attackMultiplier(eh);
      enemy.survive[b] = enDef * surviveMultiplier(eh);
    });

    let best = { val: 0 };
    for (let r = 0; r <= 1; r += 0.01) {
      for (let s = 0; s <= 1 - r; s += 0.01) {
        const a = 1 - r - s;
        const sc = score(
          { shield: r, spear: s, archer: a },
          our,
          enemy,
          enemyDefense
        );
        if (sc > best.val) best = { val: sc, ratio: { shield: r, spear: s, archer: a } };
      }
    }

    document.getElementById("resultBox").hidden = false;
    document.getElementById("resultText").innerText =
      `최적 병종 비율
방패 ${(best.ratio.shield * 100).toFixed(1)}%
창 ${(best.ratio.spear * 100).toFixed(1)}%
궁 ${(best.ratio.archer * 100).toFixed(1)}%
지표 ${best.val.toFixed(2)}`;

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("ratioChart"), {
      type: "doughnut",
      data: {
        labels: ["방패", "창", "궁"],
        datasets: [{
          data: [
            best.ratio.shield * 100,
            best.ratio.spear * 100,
            best.ratio.archer * 100
          ]
        }]
      }
    });
  };
});
