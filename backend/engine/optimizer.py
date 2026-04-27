import math
from .battle import battle_score

BRANCHES = ["shield","spear","archer"]

def verdict(score: float) -> str:
    if score >= 1.05: return "여유 승"
    if score >= 0.95: return "박빙"
    return "불리"

def frange(start, stop, step):
    while start <= stop:
        yield round(start, 10)
        start += step

def optimize_heroes_and_ratios(combat_state: dict, heroes_data: dict):
    total = combat_state["our"]["total_soldiers"]
    our_heroes = combat_state["our"]["heroes"]
    enemy = combat_state["enemy"]
    enemy_is_defense = combat_state["options"]["enemy_is_defense"]

    best={"score":0}

    for r in frange(0,1,0.01):
        for s in frange(0,1-r,0.01):
            a = 1-r-s
            ratio={"shield":r,"spear":s,"archer":a}

            score = battle_score(
                ratio=ratio,
                our_total_soldiers=total,
                our_heroes=our_heroes,
                enemy_stats=enemy["stats"],
                heroes_data=heroes_data,
                enemy_is_defense=enemy_is_defense
            )

            if score>best["score"]:
                best={
                    "score":score,
                    "ratio":ratio,
                    "heroes":our_heroes
                }

    alloc={b:int(total*best["ratio"][b]) for b in BRANCHES}

    return{
        "best_heroes":best["heroes"],
        "best_ratio":best["ratio"],
        "soldier_allocation":alloc,
        "score":round(best["score"],3),
        "verdict":verdict(best["score"]),
        "summary":
        f"추천: 방패 {best['ratio']['shield']*100:.1f}% / "
        f"창 {best['ratio']['spear']*100:.1f}% / "
        f"궁 {best['ratio']['archer']*100:.1f}% "
        f"({verdict(best['score'])})"
    }
}
