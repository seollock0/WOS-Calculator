const BRANCHES = ["shield","spear","archer"];
let HEROES = {};

function num(id){ return Number(document.getElementById(id).value||0); }

async function loadHeroes(){
  HEROES = await (await fetch("heroes.json")).json();
  BRANCHES.forEach(b=>{
    document.getElementById(`our_${b}_hero`).append(...Object.keys(HEROES[b]).map(h=>new Option(h,h)));
    document.getElementById(`enemy_${b}_hero`).append(...Object.keys(HEROES[b]).map(h=>new Option(h,h)));
  });
}

function atkMul(sk){
  let v=1+(sk.attack_pct||0);
  v*=1+(sk.damage_pct||0);
  if(sk.damage_proc){
    const p=sk.damage_proc;
    v*=1+p.chance*p.effect*p.uptime;
  }
  return v;
}
function survMul(sk){
  let v=1+(sk.hp_pct||0);
  v*=1+(sk.damage_reduce_pct||0);
  return v;
}

document.addEventListener("DOMContentLoaded", async()=>{
  await loadHeroes();

  document.getElementById("calcBtn").onclick=()=>{
    const enemyDefense=document.getElementById("enemyDefense").checked;

    let ourAtk={}, ourSur={}, enAtk={}, enSur={}, enCnt={};

    BRANCHES.forEach(b=>{
      const oh=HEROES[b][document.getElementById(`our_${b}_hero`).value].skills;
      const eh=HEROES[b][document.getElementById(`enemy_${b}_hero`).value].skills;

      ourAtk[b]=num(`our_${b}_atk`)*num(`our_${b}_pow`)*atkMul(oh);
      ourSur[b]=num(`our_${b}_def`)*num(`our_${b}_hp`)*survMul(oh);

      enAtk[b]=num(`enemy_${b}_atk`)*num(`enemy_${b}_pow`)*atkMul(eh);
      enSur[b]=num(`enemy_${b}_def`)*num(`enemy_${b}_hp`)*survMul(eh);

      enCnt[b]=num(`enemy_${b}_cnt`);
    });

    let best={val:0,ratio:null};

    for(let r=0;r<=1;r+=0.01){
      for(let s=0;s<=1-r;s+=0.01){
        const a=1-r-s;
        const ratio={shield:r,spear:s,archer:a};

        let atk1=0,sur1=0;
        BRANCHES.forEach(b=>{
          atk1+=ratio[b]*ourAtk[b];
          sur1+=ratio[b]*ourSur[b];
        });

        let atk2=0,sur2=0;
        BRANCHES.forEach(b=>{
          atk2+=enCnt[b]*enAtk[b];
          sur2+=enCnt[b]*enSur[b];
        });

        let sc=(atk1/sur1)/(atk2/sur2);
        if(enemyDefense) sc/=1.15;

        if(sc>best.val){
          best={val:sc,ratio};
        }
      }
    }

    document.getElementById("resultBox").hidden=false;
    document.getElementById("resultText").innerText=
`최적 병종 비율
방패 ${(best.ratio.shield*100).toFixed(1)}%
창 ${(best.ratio.spear*100).toFixed(1)}%
궁 ${(best.ratio.archer*100).toFixed(1)}%
지표 ${best.val.toFixed(2)}`;
  };
});
