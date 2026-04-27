def hero_multiplier(hero_name: str, heroes_data: dict) -> dict:
    hero = heroes_data[hero_name]
    return {
        "attack": hero["attack"],
        "survive": hero["survive"]
    }
