const BRANCHES = ["shield","spear","archer"];
let HEROES = {};
let chart = null;

function num(id){ return Number(document.getElementById(id).value||0); }

async function loadHeroes(){
  HEROES = await (await fetch("heroes.json")).json();

  BRANCHES.forEach(b=>{
    fill(`our_${b}_hero`, b);
    fill(`enemy_${b}_hero`, b);
  });
}

function fill(id, b){
  const s=document.getElementById(id);
  Object.keys(HEROES[b]).forEach(h=>{
    s.append(new Option(h,h));
  });
}

function atkMul(sk){
  let a=1+(sk.attack_pct||0);
  a*=1+(sk.damage_pct||0);
  a*=1+(sk.target_damage_pct||0);
  a*=1+(sk.global_damage_pct||0);
  if(sk.damage_proc){
    const p=sk.damage_proc;
    a*=1+(p.chance*p.effect*p.uptime);
  }
  return a;
}

function hpMul(sk){
  let h=1+(sk.hp_pct||0);
  h*=1+(sk.damage_reduce_pct||0);
  return h;
}

function score(r, our, enemy, def){
  let a1=0,h1=0,a2=0,h2=0;
  BRANCHES.forEach(b=>{
    a1+=r[b]*our.atk[b]; h1+=r[b]*our.hp[b];
    a2+=r[b]*enemy.atk[b]; h2+=r[b]*enemy.hp[b];
  });
  let s=(a1/h1)/(a2/h2);
  if(def) s/=1.15;
  return s;
}

document.addEventListener("DOMContentLoaded", async()=>{
  await loadHeroes();

  document.getElementById("calcBtn").onclick=()=>{
    const our={
      atk:{},hp:{}
    }, enemy={atk:{},hp:{}};

    BRANCHES.forEach(b=>{
      const oh=document.getElementById(`our_${b}_hero`).value;
      const eh=document.getElementById(`enemy_${b}_hero`).value;

      our.atk[b]=num(`our_${b}_atk`)*atkMul(HEROES[b][oh].skills);
      our.hp[b]=num(`our_${b}_hp`)*hpMul(HEROES[b][oh].skills);

      enemy.atk[b]=num(`enemy_${b}_atk`)*atkMul(HEROES[b][eh].skills);
      enemy.hp[b]=num(`enemy_${b}_hp`)*hpMul(HEROES[b][eh].skills);
    });

    let best={s:0};
    for(let r=0;r<=1;r+=0.01){
      for(let s=0;s<=1-r;s+=0.01){
        let a=1-r-s;
        let sc=score(
          {shield:r,spear:s,archer:a},
          our,enemy,
          document.getElementById("enemyDefense").checked
        );
        if(sc>best.s){
          best={s:sc,r:{shield:r,spear:s,archer:a}};
        }
      }
    }

    document.getElementById("resultBox").hidden=false;
    document.getElementById("resultText").innerText=
      `최적 병종 비율\n방패 ${(best.r.shield*100).toFixed(1)}%\n창 ${(best.r.spear*100).toFixed(1)}%\n궁 ${(best.r.archer*100).toFixed(1)}%\n점수 ${best.s.toFixed(2)}`;

    if(chart) chart.destroy();
    chart=new Chart(document.getElementById("ratioChart"),{
      type:"doughnut",
      data:{
        labels:["방패","창","궁"],
        datasets:[{
          data:[
            best.r.shield*100,
            best.r.spear*100,
            best.r.archer*100
          ]
        }]
      }
    });
  };
});
