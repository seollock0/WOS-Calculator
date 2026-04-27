from flask import Flask, request, jsonify
import json

from engine.optimizer import optimize_heroes_and_ratios

app = Flask(__name__)

# -----------------------------------
# 고정 데이터 로드 (룰북)
# -----------------------------------
with open("data/heroes.json", encoding="utf-8") as f:
    HEROES_DATA = json.load(f)

# -----------------------------------
# API 엔드포인트
# -----------------------------------
@app.route("/api/calculate", methods=["POST"])
def calculate():
    """
    프론트엔드에서 전달된 전투 상태 JSON을 받아
    최적 영웅 조합 + 병종 비율을 계산한다.
    """

    combat_state = request.get_json()

    # --- 필수 값 검증 (최소한만) ---
    if not combat_state:
        return jsonify({"error": "Invalid JSON payload"}), 400

    if "our" not in combat_state or "enemy" not in combat_state:
        return jsonify({"error": "Missing 'our' or 'enemy' data"}), 400

    if "total_soldiers" not in combat_state["our"]:
        return jsonify({"error": "Missing 'our.total_soldiers'"}), 400

    # --------------------------------
    # 계산 엔진 호출
    # --------------------------------
    try:
        result = optimize_heroes_and_ratios(
            combat_state=combat_state,
            heroes_data=HEROES_DATA
        )
    except Exception as e:
        # 디버깅용 (운영 시 로그로 교체 권장)
        return jsonify({
            "error": "Calculation failed",
            "detail": str(e)
        }), 500

    # --------------------------------
    # 정상 응답
    # --------------------------------
    return jsonify(result)


# -----------------------------------
# 로컬 실행용
# -----------------------------------
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
