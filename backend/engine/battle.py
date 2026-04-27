"""
battle.py

이 모듈은 '영웅 계수 + 병종 비율 + 총 병사 수'를 기반으로
전투 점수를 계산한다.

=== 핵심 개념 ===
- 병종별 병사 수는 입력값이 아니라:
    병종 병사 수 = 총 병사 수 × 병종 비율
- 전투는 '소모전' 가정:
    → sqrt(총 병사 수) 스케일 적용
- 영웅 효과는 heroes.py에서 계산된
    attack / survive 계수만 사용
"""

import math

BRANCHES = ["shield", "spear", "archer"]


def _calc_team_power(
    *,
    total_soldiers: int,
    ratio: dict,
    hero_multipliers: dict
) -> float:
    """
    단일 팀(아군 또는 적군)의 전투력을 계산한다.

    전투력 공식:

        team_power =
            sqrt(총 병사 수)
          × Σ(병종 비율 × 영웅 공격 계수)
          ÷ Σ(병종 비율 × 영웅 생존 계수)

    ※ 병종 기본 스탯(공격/HP)은 이미
      UI 입력 단계에서 %로 정규화되었다고 가정
      → 여기서는 '계수 비교'만 수행
    """

    if total_soldiers <= 0:
        return 0.0

    attack_sum = 0.0
    survive_sum = 0.0

    for branch in BRANCHES:
        r = ratio[branch]
        attack_sum += r * hero_multipliers[branch]["attack"]
        survive_sum += r * hero_multipliers[branch]["survive"]

    if survive_sum <= 0:
        return 0.0

    return math.sqrt(total_soldiers) * attack_sum / survive_sum


def battle_score(
    *,
    ratio: dict,
    our_total_soldiers: int,
    hero_multipliers: dict,
    enemy_is_defense: bool
) -> float:
    """
    최종 전투 점수 = 우리 전투력 / 적 전투력

    - 아군: 입력한 총 병사 수 사용
    - 적군: 비율 비교용으로 총 병사 수 = 1로 정규화
    """

    # ✅ 아군 전투력
    our_power = _calc_team_power(
        total_soldiers=our_total_soldiers,
        ratio=ratio,
        hero_multipliers=hero_multipliers
    )

    # ✅ 적군 전투력 (비율 비교 기준이므로 병사 수 1)
    enemy_power = _calc_team_power(
        total_soldiers=1,
        ratio=ratio,
        hero_multipliers=hero_multipliers
    )

    # ✅ 수성 보정
    if enemy_is_defense:
        # 수성 이점(HP/지형/구조물)을 단일 계수로 모델링
        enemy_power *= 1.15

    if enemy_power <= 0:
        return 0.0

    return our_power / enemy_power
