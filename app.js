const BRANCHES = ["shield","spear","archer"];
let HEROES = {};

function el(id) {
  return Number(document.getElementById(id).value || 0);
}

async function loadHeroes() {
  const res = await fetch("heroes.json");
  HEROES = await res.json();
}

function branchPower(stats) {
  // 공격 * 파괴력 / HP 단순화 모델
  return (stats.atk * stats.pow) / stats.hp;
}

function teamPower(ratio, branchStats, heroMult, totalSoldiers) {
  let atk = 0, hp = 0;
  BRANCHES.forEach(b=>{
    atk += ratio[b] * branchStats[b] * heroMult[b];
    hp  += ratio[b];
  });
  return Math.sqrt(totalSoldiers) * atk / hp;
}

function optimize(data) {
  let best={score:0};

  BRANCHES.forEach(()=>{});

  for(let r=0;r<=1;r+=0.01){
    for(let s=0;s<=1-r;s+=0.01){
      let a=1-r-s;
      let ratio={shield:r,spear:s,archer:a};

      let our = teamPower(ratio,data.ourStats,{shield:1,spear:1,archer:1},data.ourTotal);
      let enemy = teamPower(ratio,data.enemyStats,{shield:1,spear:1,archer:1},data.enemyTotal);

      if(data.enemyDefense) enemy*=1.15;
      let score=our/enemy;

      if(score>best.score){
        best={score,ratio};
      }
    }
  }
  return best;
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadHeroes();

  document.getElementById("calcBtn").onclick=()=>{
    const data={
      enemyDefense:document.getElementById("enemyDefense").checked,
      ourTotal:el("our_total_count"),
      enemyTotal:
        el("enemy_shield_count")+el("enemy_spear_count")+el("enemy_archer_count"),
      ourStats:{
        shield:branchPower({
          atk:el("our_shield_atk"),hp:el("our_shield_hp"),pow:el("our_shield_pow")
        }),
        spear:branchPower({
          atk:el("our_spear_atk"),hp:el("our_spear_hp"),pow:el("our_spear_pow")
        }),
        archer:branchPower({
          atk:el("our_archer_atk"),hp:el("our_archer_hp"),pow:el("our_archer_pow")
        })
      },
      enemyStats:{
        shield:branchPower({
          atk:el("enemy_shield_atk"),hp:el("enemy_shield_hp"),pow:el("enemy_shield_pow")
        }),
        spear:branchPower({
          atk:el("enemy_spear_atk"),hp:el("enemy_spear_hp"),pow:el("enemy_spear_pow")
        }),
        archer:branchPower({
          atk:el("enemy_archer_atk"),hp:el("enemy_archer_hp"),pow:el("enemy_archer_pow")
        })
      }
    };

    const res=optimize(data);
    const resultBox=document.getElementById("resultBox");
    resultBox.hidden=false;

    document.getElementById("result").innerText=
      `최적 병종 비율\n방패 ${(res.ratio.shield*100).toFixed(1)}%\n`+
      `창 ${(res.ratio.spear*100).toFixed(1)}%\n궁 ${(res.ratio.archer*100).toFixed(1)}%\n`+
      `점수 ${res.score.toFixed(2)}`;
  };
});
