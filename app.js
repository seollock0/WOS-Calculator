// 사용 가능한 영웅 목록
const HEROES = [
  "제로니모",
  "에디스",
  "레니",
  "미아",
  "고든",
  "브래들리",
  "웨인"
];

// ✅ 영웅 드롭다운 채우기
function fillHeroDropdowns() {
  const selectIds = [
    "our_shield_hero",
    "our_spear_hero",
    "our_archer_hero"
  ];

  selectIds.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;

    // 중복 방지
    select.innerHTML = "";

    HEROES.forEach(hero => {
      const option = document.createElement("option");
      option.value = hero;
      option.textContent = hero;
      select.appendChild(option);
    });
  });
}

// ✅ DOM이 완전히 로드된 뒤 실행
document.addEventListener("DOMContentLoaded", () => {
  fillHeroDropdowns();

  document.getElementById("calcBtn").addEventListener("click", () => {
    alert("영웅 선택 드롭다운 정상 동작 ✅\n다음 단계: API 연결");
  });
});
