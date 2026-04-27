function val(id) {
  return Number(document.getElementById(id).value || 0);
}

function collectTeam(prefix) {
  return {
    shield: {
      count: val(`${prefix}_shield_count`),
      tier: val(`${prefix}_shield_tier`),
      fc: val(`${prefix}_shield_fc`),
      stats: {
        atk: val(`${prefix}_shield_atk`),
        def: val(`${prefix}_shield_def`),
        hp: val(`${prefix}_shield_hp`)
      }
    },
    spear: {
      count: val(`${prefix}_spear_count`),
      tier: val(`${prefix}_spear_tier`),
      fc: val(`${prefix}_spear_fc`),
      stats: {
        atk: val(`${prefix}_spear_atk`),
        def: val(`${prefix}_spear_def`),
        hp: val(`${prefix}_spear_hp`)
      }
    },
    archer: {
      count: val(`${prefix}_archer_count`),
      tier: val(`${prefix}_archer_tier`),
      fc: val(`${prefix}_archer_fc`),
      stats: {
        atk: val(`${prefix}_archer_atk`),
        def: val(`${prefix}_archer_def`),
        hp: val(`${prefix}_archer_hp`)
      }
    }
  };
}

document.getElementById("calcBtn").onclick = async () => {

  const payload = {
    options: {
      step: Number(document.getElementById("step").value),
      enemy_is_defense: document.getElementById("enemyDefense").checked
    },
    our_team: collectTeam("our"),
    enemy_team: collectTeam("enemy")
  };

  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  document.getElementById("resultBox").hidden = false;

  document.getElementById("resultHeroes").innerText =
    `영웅 조합\n방패: ${data.best_heroes.shield}\n창: ${data.best_heroes.spear}\n궁: ${data.best_heroes.archer}`;

  document.getElementById("resultRatio").innerText =
    `병과 비율\n방패 ${(data.best_ratio.shield*100).toFixed(1)}%\n창 ${(data.best_ratio.spear*100).toFixed(1)}%\n궁 ${(data.best_ratio.archer*100).toFixed(1)}%`;

  document.getElementById("resultVerdict").innerText =
    `판정: ${data.verdict} (지표 ${data.score.toFixed(2)})`;

  document.getElementById("resultSummary").innerText =
    data.summary;
};
