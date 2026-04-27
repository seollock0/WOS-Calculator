import math

BRANCHES = ["shield", "spear", "archer"]


def calc_team_power(
    *,
    total_soldiers: int,
    ratio: dict,
    stats: dict,
    heroes: dict,
    heroes_data: dict
) -> float:
    """
    계산 대상 팀(아군 또는 적군)의 전투력을 계산한다.

    전투력 산식:
    √(총 병사 수)
    × Σ(병과 비율 × 병과 공격력 × 영웅 공격 계수)
    ÷ Σ(병과 비율 × 병과 HP × 영웅 생존 계수)
    """

    if total_soldiers <= 0:
        return 0.0

    attack_sum = 0.0
    hp_sum = 0.0

    for branch in BRANCHES:
        r = ratio[branch]
        branch_stats = stats[branch]
        hero_name = heroes[branch]

        hero_attack = heroes_data[hero_name]["attack"]
        hero_survive = heroes_data[hero_name]["survive"]

        # 병과별 공격력 / HP는 "최종 % 반영 값"이 이미 들어온 상태라고 가정
        attack_sum += r * branch_stats["atk"] * hero_attack
        hp_sum += r * branch_stats["hp"] * hero_survive

    if hp_sum <= 0:
        return 0.0

    return math.sqrt(total_soldiers) * attack_sum / hp_sum


def battle_score(
    *,
    ratio: dict,
    our_total_soldiers: int,
    our_stats: dict,
    our_heroes: dict,
    enemy_stats: dict,
    enemy_heroes: dict,
    heroes_data: dict,
    enemy_is_defense: bool
) -> float:
    """
    우리 전투력 / 적 전투력 비율을 반환한다.
    """

    our_power = calc_team_power(
        total_soldiers=our_total_soldiers,
        ratio=ratio,
        stats=our_stats,
        heroes=our_heroes,
        heroes_data=heroes_data
    )

    # 적은 병과 비율 비교용이므로 총 병사 수 1로 정규화
    enemy_power = calc_team_power(
        total_soldiers=1,
        ratio=ratio,
        stats=enemy_stats,
        heroes=enemy_heroes,
        heroes_data=heroes_data
    )

    # 수성 보정
    if enemy_is_defense:
        enemy_power *= 1.15

    if enemy_power <= 0:
        return 0.0

    return our_power / enemy_power
