/**
 * 과제 알림 게시판 타입 정의 파일
 * 과제 데이터 구조 및 메모지 테마 색상 정의
 */

// 메모지 테마 색상 키 정의
export type MemoColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

// 과제 데이터 인터페이스
export interface Assignment {
  id: string;             // 고유 식별자 (UUID 등)
  subject: string;        // 과목 이름 (예: 컴퓨터구조, 경영통계학)
  title: string;          // 과제명 (예: 5장 연습문제 풀이 제출)
  deadline: string;       // 제출 기한 (ISO 문자열 형태 YYYY-MM-DDTHH:mm)
  memo?: string;          // 추가 상세 메모/참고사항 (선택)
  color: MemoColor;       // 메모지 색상 테마
  createdAt: string;      // 생성 일시
  isCompleted: boolean;   // 완료 여부 (true인 경우 '완료된 과제' 탭으로 이동)
  completedAt?: string;   // 과제 완료 일시
  rotation?: number;      // 메모지 약간의 기울기 효과 (-2 ~ 2도)
}

// 필터 및 정렬 옵션 타입
export type SortOption = 'deadline-asc' | 'deadline-desc' | 'created-desc' | 'subject';
