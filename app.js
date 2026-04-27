function num(id) {
  return Number(document.getElementById(id).value || 0);
}

const HEROES = ["제로니모","에디스","레니","미아","고든","브래들리","웨인"];

function fillHeroes() {
  ["our_shield_hero","our_spear_hero","our_archer_hero"].forEach(id=>{
    const sel=document.getElementById(id);
    HEROES.forEach(h=>{
      const o=document.createElement("option");
      o.value=h; o.text=h;
      sel.appendChild(o);
    });
  });
}
fillHeroes();

document.getElementById("calcBtn").onclick = async () => {

  const totalSoldiers = num("our_total_count");

  const payload = {
    options: {
      step: 0.01, // ✅ 1% 고정
      enemy_is_defense: document.getElementById("enemyDefense").checked
    },
    our: {
      total_soldiers: totalSoldiers,
      heroes: {
        shield: document.getElementById("our_shield_hero").value,
        spear:  document.getElementById("our_spear_hero").value,
        archer: document.getElementById("our_archer_hero").value
      }
    },
    enemy: {
      total_soldiers: num("enemy_total_count"),
      tier: num("enemy_tier"),
      fc: num("enemy_fc"),
      stats: {
        shield: {
          atk: num("enemy_shield_atk"),
          def: num("enemy_shield_def"),
          hp:  num("enemy_shield_hp")
        },
        spear: {
          atk: num("enemy_spear_atk"),
          def: num("enemy_spear_def"),
          hp:  num("enemy_spear_hp")
        },
        archer: {
          atk: num("enemy_archer_atk"),
          def: num("enemy_archer_def"),
          hp:  num("enemy_archer_hp")
        }
      }
    }
  };

  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  document.getElementById("resultBox").hidden=false;

  document.getElementById("resultHeroes").innerText =
    `영웅 조합\n방패: ${data.best_heroes.shield}\n창: ${data.best_heroes.spear}\n궁: ${data.best_heroes.archer}`;

  document.getElementById("resultRatio").innerText =
    `병종 비율\n방패 ${(data.best_ratio.shield*100).toFixed(1)}%\n`
  + `창 ${(data.best_ratio.spear*100).toFixed(1)}%\n`
  + `궁 ${(data.best_ratio.archer*100).toFixed(1)}%`;

  document.getElementById("resultCounts").innerText =
    `병종별 병사 수\n방패 ${data.soldier_allocation.shield.toLocaleString()}\n`
  + `창 ${data.soldier_allocation.spear.toLocaleString()}\n`
  + `궁 ${data.soldier_allocation.archer.toLocaleString()}`;

  document.getElementById("resultVerdict").innerText =
    `판정: ${data.verdict} (지표 ${data.score})`;

  document.getElementById("resultSummary").innerText = data.summary;
};
