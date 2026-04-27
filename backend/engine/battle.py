import math
from .heroes import hero_multiplier


def team_power(team, ratio, heroes_data):
    total_count = sum(
        team[b]["count"] * ratio[b] for b in ["shield", "spear", "archer"]
    )

    atk = 0.0
    hp = 0.0

    for b in ["shield", "spear", "archer"]:
        m = hero_multiplier(team[b]["hero"], heroes_data)
        atk += ratio[b] * team[b]["stats"]["atk"] * m["attack"]
        hp  += ratio[b] * team[b]["stats"]["hp"]  * m["survive"]

    if hp == 0:
        return 0

    return math.sqrt(total_count) * atk / hp


def battle_score(our_team, enemy_team, ratio, heroes_data, enemy_is_defense):
    our = team_power(our_team, ratio, heroes_data)
    enemy = team_power(enemy_team, ratio, heroes_data)

    if enemy_is_defense:
        enemy *= 1.15

    if enemy == 0:
        return 0

    return our / enemy
