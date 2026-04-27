from .battle import battle_score

BRANCHES = ["shield", "spear", "archer"]


def verdict_from_score(score: float) -> str:
    if score >= 1.05:
        return "여유 승"
    if score >= 0.95:
        return "박빙"
    return "불리"


def optimize_heroes_and_ratios(combat_state: dict, heroes_data: dict):
    our_team = combat_state["our_team"]
    enemy_team = combat_state["enemy_team"]
    step = combat_state["options"]["step"]
    enemy_is_defense = combat_state["options"]["enemy_is_defense"]

    hero_list = list(heroes_data.keys())

    best = {
        "score": 0,
        "ratio": None,
        "heroes": None
    }

    for h_shield in hero_list:
        for h_spear in hero_list:
            for h_archer in hero_list:

                our_team["shield"]["hero"] = h_shield
                our_team["spear"]["hero"] = h_spear
                our_team["archer"]["hero"] = h_archer

                r = 0.0
                while r <= 1.0:
                    s = 0.0
                    while s <= 1.0 - r:
                        a = 1.0 - r - s
                        ratio = {"shield": r, "spear": s, "archer": a}

                        score = battle_score(
                            our_team,
                            enemy_team,
                            ratio,
                            heroes_data,
                            enemy_is_defense
                        )

                        if score > best["score"]:
                            best = {
                                "score": score,
                                "ratio": ratio,
                                "heroes": {
                                    "shield": h_shield,
                                    "spear": h_spear,
                                    "archer": h_archer
                                }
                            }
                        s += step
                    r += step

    return {
        "best_heroes": best["heroes"],
        "best_ratio": best["ratio"],
        "score": round(best["score"], 3),
        "verdict": verdict_from_score(best["score"]),
        "summary":
            f"추천: 방패 {best['ratio']['shield']*100:.1f}% / "
            f"창 {best['ratio']['spear']*100:.1f}% / "
            f"궁 {best['ratio']['archer']*100:.1f}% "
            f"({verdict_from_score(best['score'])})"
    }
