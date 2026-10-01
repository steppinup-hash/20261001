/**
 * 날짜 및 기한(D-Day) 계산 관련 유틸리티 함수 모음
 * 한국어 주석 포함
 */

/**
 * 마감일까지 남은 날짜(D-Day) 및 상태를 계산하는 함수
 * @param deadlineStr 'YYYY-MM-DDTHH:mm' 형식의 마감일 문자열
 * @returns { label: string, isUrgent: boolean, isOverdue: boolean, daysDiff: number }
 */
export function calculateDDay(deadlineStr: string): {
  label: string;
  isUrgent: boolean;
  isOverdue: boolean;
  daysDiff: number;
} {
  if (!deadlineStr) {
    return { label: '기한 없음', isUrgent: false, isOverdue: false, daysDiff: 0 };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);

  // 날짜 비교를 위해 자정 기준으로 정규화
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).getTime();

  const oneDayMs = 1000 * 60 * 60 * 24;
  const diffTime = deadlineMidnight - todayMidnight;
  const daysDiff = Math.round(diffTime / oneDayMs);

  // 정확한 시간 차이 (밀리초)
  const exactDiffMs = deadline.getTime() - now.getTime();

  if (exactDiffMs < 0) {
    // 이미 기한이 지난 경우
    const passedDays = Math.abs(daysDiff);
    return {
      label: passedDays === 0 ? '기한 지남 (금일 마감)' : `기한 초과 (D+${passedDays})`,
      isUrgent: true,
      isOverdue: true,
      daysDiff,
    };
  }

  if (daysDiff === 0) {
    // 오늘 마감인 경우
    const hoursLeft = Math.floor(exactDiffMs / (1000 * 60 * 60));
    return {
      label: hoursLeft > 0 ? `오늘 마감 (${hoursLeft}시간 남음)` : '마감 임박 (1시간 이내)',
      isUrgent: true,
      isOverdue: false,
      daysDiff: 0,
    };
  }

  if (daysDiff === 1) {
    return {
      label: 'D-1 (내일 마감)',
      isUrgent: true,
      isOverdue: false,
      daysDiff: 1,
    };
  }

  return {
    label: `D-${daysDiff}`,
    isUrgent: daysDiff <= 3, // 3일 이내면 긴급 표시
    isOverdue: false,
    daysDiff,
  };
}

/**
 * 날짜 문자열을 보기 쉬운 한국어 형식으로 변환하는 함수
 * 예: "2026. 10. 05 (월) 오후 11:59"
 */
export function formatKoreanDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = daysOfWeek[date.getDay()];

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0시일 때는 12시로 표시

  return `${year}년 ${month}월 ${day}일 (${dayName}) ${ampm} ${hours}:${minutes}`;
}

/**
 * 기본 입력값으로 사용할 마감일시 (기본 3일 뒤 오후 11:59) 생성
 */
export function getDefaultDeadline(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}T23:59`;
}
