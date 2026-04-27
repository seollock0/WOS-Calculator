let HEROES_BY_BRANCH = {};

async function loadHeroes() {
  const res = await fetch("/api/heroes");
  HEROES_BY_BRANCH = await res.json();

  fillDropdown("our_shield_hero", "shield");
  fillDropdown("our_spear_hero", "spear");
  fillDropdown("our_archer_hero", "archer");
}

function fillDropdown(selectId, branch) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";

  const heroes = HEROES_BY_BRANCH[branch];
  Object.keys(heroes).forEach(hero => {
    const option = document.createElement("option");
    option.value = hero;
    option.textContent = hero;
    select.appendChild(option);
  });
}

function num(id) {
  return Number(document.getElementById(id).value || 0);
}

document.addEventListener("DOMContentLoaded", () => {
  loadHeroes();

  document.getElementById("calcBtn").addEventListener("click", async () => {

    const payload = {
      options: {
        step: 0.01, // 1% 고정
        enemy_is_defense: document.getElementById("enemyDefense").checked
      },
      our: {
        total_soldiers: num("our_total_count"),
        heroes: {
          shield: document.getElementById("our_shield_hero").value,
          spear: document.getElementById("our_spear_hero").value,
          archer: document.getElementById("our_archer_hero").value
        }
      },
      enemy: {
        is_defense: document.getElementById("enemyDefense").checked
      }
    };

    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    document.getElementById("resultBox").hidden = false;

    document.getElementById("resultHeroes").innerText =
      `영웅 조합\n방패: ${data.best_heroes.shield}\n창: ${data.best_heroes.spear}\n궁: ${data.best_heroes.archer}`;

    document.getElementById("resultRatio").innerText =
      `병종 비율\n방패 ${(data.best_ratio.shield*100).toFixed(1)}%\n` +
      `창 ${(data.best_ratio.spear*100).toFixed(1)}%\n` +
      `궁 ${(data.best_ratio.archer*100).toFixed(1)}%`;

    document.getElementById("resultCounts").innerText =
      `병종별 병사 수\n방패 ${data.soldier_allocation.shield.toLocaleString()}\n` +
      `창 ${data.soldier_allocation.spear.toLocaleString()}\n` +
      `궁 ${data.soldier_allocation.archer.toLocaleString()}`;

    document.getElementById("resultVerdict").innerText =
      `판정: ${data.verdict} (지표 ${data.score})`;

    document.getElementById("resultSummary").innerText = data.summary;
  });
});
