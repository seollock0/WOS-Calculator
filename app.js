function num(id) {
  return Number(document.getElementById(id).value || 0);
}

document.getElementById("calcBtn").onclick = async () => {

  const totalSoldiers = num("our_total_count");

  const payload = {
    options: {
      step: Number(document.getElementById("step").value),
      enemy_is_defense: document.getElementById("enemyDefense").checked
    },
    our: {
      total_soldiers: totalSoldiers,
      stats: {
        shield: {
          tier: num("our_shield_tier"),
          fc: num("our_shield_fc"),
          atk: num("our_shield_atk"),
          def: num("our_shield_def"),
          hp: num("our_shield_hp")
        },
        spear: {
          tier: num("our_spear_tier"),
          fc: num("our_spear_fc"),
          atk: num("our_spear_atk"),
          def: num("our_spear_def"),
          hp: num("our_spear_hp")
        },
        archer: {
          tier: num("our_archer_tier"),
          fc: num("our_archer_fc"),
          atk: num("our_archer_atk"),
          def: num("our_archer_def"),
          hp: num("our_archer_hp")
        }
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
    `병과 비율\n방패 ${(data.best_ratio.shield*100).toFixed(1)}%\n창 ${(data.best_ratio.spear*100).toFixed(1)}%\n궁 ${(data.best_ratio.archer*100).toFixed(1)}%`;

  document.getElementById("resultCounts").innerText =
    `병과별 병사 수\n방패 ${data.soldier_allocation.shield.toLocaleString()}\n` +
    `창 ${data.soldier_allocation.spear.toLocaleString()}\n` +
    `궁 ${data.soldier_allocation.archer.toLocaleString()}`;

  document.getElementById("resultVerdict").innerText =
    `판정: ${data.verdict} (지표 ${data.score})`;

  document.getElementById("resultSummary").innerText = data.summary;
};
