from .battle import battle_score
from .heroes import calc_attack_multiplier, calc_survive_multiplier

BRANCHES = ["shield", "spear", "archer"]


def verdict(score: float) -> str:
    if score >= 1.05:
        return "여유 승"
    if score >= 0.95:
        return "박빙"
    return "불리"


def frange(start, stop, step):
    while start <= stop:
        yield round(start, 10)
        start += step


def optimize_heroes_and_ratios(combat_state: dict, heroes_data: dict):
    """
    처리 순서:
    1. 병종별 영웅 조합 완전 탐색
    2. 각 조합마다 병종 비율(1% 단위) 탐색
    3. 전투 점수 최대값 선택
    """

    total = combat_state["our"]["total_soldiers"]
    enemy_is_defense = combat_state["options"]["enemy_is_defense"]

    best = {"score": 0.0}

    for shield_hero, shield_data in heroes_data["shield"].items():
        for spear_hero, spear_data in heroes_data["spear"].items():
            for archer_hero, archer_data in heroes_data["archer"].items():

                heroes = {
                    "shield": shield_hero,
                    "spear": spear_hero,
                    "archer": archer_hero
                }

                hero_multipliers = {
                    "shield": {
                        "attack": calc_attack_multiplier(shield_data["skills"]),
                        "survive": calc_survive_multiplier(shield_data["skills"])
                    },
                    "spear": {
                        "attack": calc_attack_multiplier(spear_data["skills"]),
                        "survive": calc_survive_multiplier(spear_data["skills"])
                    },
                    "archer": {
                        "attack": calc_attack_multiplier(archer_data["skills"]),
                        "survive": calc_survive_multiplier(archer_data["skills"])
                    }
                }

                for r in frange(0, 1, 0.01):
                    for s in frange(0, 1 - r, 0.01):
                        a = 1 - r - s

                        ratio = {
                            "shield": r,
                            "spear": s,
                            "archer": a
                        }

                        score = battle_score(
                            ratio=ratio,
                            our_total_soldiers=total,
                            hero_multipliers=hero_multipliers,
                            enemy_is_defense=enemy_is_defense
                        )

                        if score > best["score"]:
                            best = {
                                "score": score,
                                "heroes": heroes,
                                "ratio": ratio
                            }

    allocation = {
        b: int(total * best["ratio"][b])
        for b in BRANCHES
    }

    return {
        "best_heroes": best["heroes"],
        "best_ratio": best["ratio"],
        "soldier_allocation": allocation,
        "score": round(best["score"], 3),
        "verdict": verdict(best["score"]),
        "summary": (
            f"추천: 방패 {best['ratio']['shield']*100:.1f}% / "
            f"창 {best['ratio']['spear']*100:.1f}% / "
            f"궁 {best['ratio']['archer']*100:.1f}% "
            f"({verdict(best['score'])})"
        )
    }
