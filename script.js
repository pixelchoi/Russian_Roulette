// 전역 게임 시스템 상태 관리 변수
let penalties = [];
let totalChambers = 6;
let currentShotCount = 0;
let cylinderRotation = 0;
let isGameOver = false;

// DOM 요소 탐색
const cylinder = document.getElementById('cylinder');
const chambers = document.querySelectorAll('.chamber');
const penaltyInput = document.getElementById('penaltyInput');
const resultText = document.getElementById('resultText');
const statusText = document.getElementById('statusText');
const bulletCounter = document.getElementById('bulletCounter');
const mainContainer = document.getElementById('mainContainer');
const reloadBtn = document.getElementById('reloadBtn');
const shootBtn = document.getElementById('shootBtn');

// 게임 생성 및 난수 셔플 시스템
function initGame() {
    let items = penaltyInput.value.split(',').map(item => item.trim()).filter(item => item !== "");
    
    penalties = [...items];
    while(penalties.length < 6) {
        penalties.push("통과!");
    }
    if(penalties.length > 6) {
        penalties = penalties.slice(0, 6);
    }

    // 현대적인 피셔-예이츠 셔플 알고리즘으로 탄환 배열 섞기
    for (let i = penalties.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [penalties[i], penalties[j]] = [penalties[j], penalties[i]];
    }

    // 상태값 원상 복구 및 UI 리셋
    currentShotCount = 0;
    isGameOver = false;
    resultText.innerText = "";
    resultText.style.color = "white";
    statusText.innerText = "새 탄창이 장전되었습니다!";
    statusText.style.color = "white";
    bulletCounter.innerText = `남은 총알: 6 / 6 발`;
    reloadBtn.classList.remove('active');
    shootBtn.disabled = false;

    chambers.forEach((chamber) => {
        chamber.className = 'chamber loaded';
    });
}

// 방아쇠 격발 시스템
function pullTrigger() {
    if (isGameOver) return;

    if (currentShotCount >= totalChambers) {
        statusText.innerText = "탄창이 비었습니다! 재장전을 하세요.";
        statusText.style.color = '#ff4757';
        return;
    }

    // 실린더 회전 연출 (60도 제어)
    cylinderRotation += 60;
    cylinder.style.transform = `rotate(${cylinderRotation}deg)`;

    // 현재 발사 노즐(12시 방향)에 안착할 실린더 인덱스 수학적 계산
    let currentChamberIndex = (6 - (currentShotCount % 6)) % 6;
    
    // 회전 기믹 종료 타이밍에 맞춰 격발 로직 동기화
    setTimeout(() => {
        let currentResult = penalties[currentShotCount];
        
        chambers[currentChamberIndex].classList.remove('loaded');
        chambers[currentChamberIndex].classList.add('fired');
        
        currentShotCount++;
        bulletCounter.innerText = `남은 총알: ${6 - currentShotCount} / 6 발`;

        if (currentResult !== "통과!") {
            // 벌칙 당첨 시 연출 극대화
            isGameOver = true;
            shootBtn.disabled = true;
            statusText.innerText = "🚨 격발 완료! 벌칙 당첨! 🚨";
            statusText.style.color = '#ff4757';
            
            resultText.innerText = `💥 BANG! [${currentResult}]`;
            resultText.style.color = '#ff4757';
            
            // 진동 이펙트 활성화 후 자동 소거
            mainContainer.classList.add('shake-effect');
            setTimeout(() => {
                mainContainer.classList.remove('shake-effect');
            }, 600);

            reloadBtn.classList.add('active');

        } else {
            // 생존 처리
            statusText.innerText = "...찰칵! 빈 총성이 울렸습니다.";
            statusText.style.color = '#2ed573';
            resultText.innerText = "세이프! 😮";
            resultText.style.color = '#2ed573';

            if (currentShotCount === totalChambers) {
                statusText.innerText = "휴... 6발을 모두 버텼습니다! 재장전하세요.";
                reloadBtn.classList.add('active');
            }
        }
    }, 250);
}

// 재장전 메커니즘
function reloadRevolver() {
    cylinderRotation += 360; // 360도 스핀 모션 추가
    cylinder.style.transform = `rotate(${cylinderRotation}deg)`;
    
    statusText.innerText = "딸깍딸깍... 탄창 비우고 새로 장전 중...";
    
    setTimeout(() => {
        initGame();
    }, 400);
}

// 입력 데이터 실시간 스트리밍 감지 리스너
penaltyInput.addEventListener('change', () => {
    if(currentShotCount === 0) initGame();
});

// 초기 구동 실행
window.onload = initGame;
