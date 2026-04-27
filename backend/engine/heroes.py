"""
heroes.py

이 모듈은 heroes.json에 기록된 '원천 스킬 수치'를 기반으로
공격 계수(attack multiplier)와 생존 계수(survive multiplier)를 계산한다.

=== 설계 원칙 ===
- heroes.json에는 절대 attack / survive 값을 직접 적지 않는다
- 게임에 표시된 % 스킬 수치만 기록한다
- 계산 공식은 코드 + 주석으로 고정한다
"""

def calc_attack_multiplier(skills: dict) -> float:
    """
    공격 계수 계산 공식

    attack_multiplier =
        (1 + 공격력 증가%)
      × (1 + 피해 증가%)
      × (1 + 대상 피해 증가%)
      × (1 + 글로벌 피해 증가%)
      × (1 + 발동형 스킬 기대값)

    발동형 스킬 기대값 계산:
        expected =
            chance × effect × uptime

    예시:
        chance = 0.30
        effect = 0.30
        uptime = 0.50
        → expected = 0.045
        → 실제 곱계수 = (1 + 0.045)
    """

    attack = 1.0

    # 1️⃣ 기본 공격력 증가
    attack += skills.get("attack_pct", 0.0)

    # 2️⃣ 피해 증가 계층
    attack *= (1 + skills.get("damage_pct", 0.0))

    # 3️⃣ 특정 타깃 피해 증가 (병종, 타깃 등)
    attack *= (1 + skills.get("target_damage_pct", 0.0))

    # 4️⃣ 전체 대상 피해 증가
    attack *= (1 + skills.get("global_damage_pct", 0.0))

    # 5️⃣ 발동형 스킬 (확률 × 효과 × 유지시간)
    proc = skills.get("damage_proc")
    if proc:
        expected = (
            proc.get("chance", 0.0)
            * proc.get("effect", 0.0)
            * proc.get("uptime", 0.0)
        )
        attack *= (1 + expected)

    return attack


def calc_survive_multiplier(skills: dict) -> float:
    """
    생존 계수 계산 공식

    survive_multiplier =
        (1 + HP 증가%)
      × (1 + 피해 감소%)

    ※ 방어력%는 현재 모델에서는 HP 증가와 동일 계층으로 간주
    """

    survive = 1.0

    # 1️⃣ HP 증가
    survive += skills.get("hp_pct", 0.0)

    # 2️⃣ 피해 감소
    survive *= (1 + skills.get("damage_reduce_pct", 0.0))

    return survive
