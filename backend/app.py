from flask import Flask, request, jsonify
import json

from engine.optimizer import optimize_heroes_and_ratios

app = Flask(__name__)

# 데이터 로드
with open("data/heroes.json", encoding="utf-8") as f:
    HEROES = json.load(f)

@app.route("/api/calculate", methods=["POST"])
def calculate():
    payload = request.json

    result = optimize_heroes_and_ratios(
        combat_state=payload,
        heroes_data=HEROES
    )

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
