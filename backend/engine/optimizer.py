import math
from .battle import battle_score

def verdict(score: float) -> str:
    if score >= 1.05:
        return "여유 승"
    if score >= 0.95:
        return "박빙"
    return "불리"

def optimize_heroes_and_ratios(combat_state: dict, heroes_data: dict):
    our = combat_state["our"]
    total_soldiers = our["total_soldiers"]
    enemy_is_defense = combat_state["enemy"]["is_defense"]
    step = combat_state["options"]["step"]

    hero_list = list(heroes_data.keys())
    best = {"score": 0}

    for h_shield in hero_list:
        for h_spear in hero_list:
            for h_archer in hero_list:

                for r in frange(0, 1, step):
                    for s in frange(0, 1-r, step):
                        a = 1 - r - s

                        ratio = {"shield": r, "spear": s, "archer": a}

                        score = battle_score(
                            ratio=ratio,
                            heroes={"shield": h_shield, "spear": h_spear, "archer": h_archer},
                            stats=our["stats"],
                            heroes_data=heroes_data,
                            enemy_is_defense=enemy_is_defense
                        )

                        if score > best.get("score", 0):
                            best = {
                                "score": score,
                                "heroes": {"shield": h_shield, "spear": h_spear, "archer": h_archer},
                                "ratio": ratio
                            }

    alloc = {
        b: int(total_soldiers * best["ratio"][b])
        for b in ["shield", "spear", "archer"]
    }

    return {
        "best_heroes": best["heroes"],
        "best_ratio": best["ratio"],
        "soldier_allocation": alloc,
        "score": round(best["score"], 3),
        "verdict": verdict(best["score"]),
        "summary":
            f"추천: 방패 {best['ratio']['shield']*100:.1f}% / "
            f"창 {best['ratio']['spear']*100:.1f}% / "
            f"궁 {best['ratio']['archer']*100:.1f}% "
            f"({verdict(best['score'])})"
    }

def frange(start, stop, step):
    while start <= stop:
        yield round(start, 10)
        start += step
