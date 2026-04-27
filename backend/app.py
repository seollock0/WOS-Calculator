from flask import Flask, request, jsonify
import json
from engine.optimizer import optimize_heroes_and_ratios

app = Flask(__name__)

# 고정 영웅 데이터 로드
with open("data/heroes.json", encoding="utf-8") as f:
    HEROES_DATA = json.load(f)


@app.route("/api/heroes", methods=["GET"])
def get_heroes():
    """
    병종별 영웅 목록 + 스킬 원천 데이터 반환
    (프론트엔드 드롭다운용)
    """
    return jsonify(HEROES_DATA)


@app.route("/api/calculate", methods=["POST"])
def calculate():
    combat_state = request.get_json()

    if not combat_state:
        return jsonify({"error": "Invalid JSON"}), 400

    try:
        result = optimize_heroes_and_ratios(
            combat_state=combat_state,
            heroes_data=HEROES_DATA
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Calculation failed",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
