// =====================================================
// hero data (from /heroes.json)
// =====================================================
let HEROES_BY_BRANCH = {};

// root(/)에 있는 heroes.json 로드
async function loadHeroes() {
  try {
    const res = await fetch("heroes.json"); // ✅ main root 기준
    if (!res.ok) {
      throw new Error("heroes.json 로드 실패");
    }

    HEROES_BY_BRANCH = await res.json();

    fillHeroDropdown("our_shield_hero", "shield");
    fillHeroDropdown("our_spear_hero", "spear");
    fillHeroDropdown("our_archer_hero", "archer");

  } catch (err) {
    console.error("영웅 데이터 로드 오류:", err);
    alert("heroes.json을 불러오지 못했습니다. 파일 위치를 확인하세요.");
  }
}

// 병종별 드롭다운 채우기
function fillHeroDropdown(selectId, branch) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = "";

  const heroes = HEROES_BY_BRANCH[branch];
  if (!heroes) return;

  Object.keys(heroes).forEach(heroName => {
    const option = document.createElement("option");
    option.value = heroName;
    option.textContent = heroName;
    select.appendChild(option);
  });
}

// 숫자 입력 헬퍼
function num(id) {
  return Number(document.getElementById(id).value || 0);
}

// =====================================================
// DOM Ready
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  loadHeroes();

  document.getElementById("calcBtn").addEventListener("click", () => {
    // ✅ 여기서는 아직 API 연동 전이라 검증용 alert만 사용
    alert("영웅 드롭다운 정상 동작 ✅\n다음 단계: 계산 API 연결");
  });
});
