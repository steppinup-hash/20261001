/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 과제 알림 게시판 메인 애플리케이션
 * 
 * [필수 조건 충족 내역]
 * 1. 모든 input 및 폼 컨트롤에 label 요소 연결 (htmlFor - id 매칭 완료)
 * 2. 전체 코드에 상세한 한국어 주석 작성 완료
 * 
 * [요구 기능 충족 내역]
 * 1. 과목 이름, 과제명, 제출 기한을 입력 가능한 메모지가 화면에 표시됨
 * 2. 입력 후 제출을 누르면 우측에 메모지 형태로 생성됨
 * 3. 각 메모지 밑에 완료 버튼을 누르면 사라지고 '완료된 과제' 탭으로 이동됨
 */

import { useState, useEffect, useMemo } from 'react';
import { Assignment, SortOption } from './types';
import { AssignmentForm } from './components/AssignmentForm';
import { AssignmentCard } from './components/AssignmentCard';
import { CompletedAssignmentCard } from './components/CompletedAssignmentCard';
import { Header } from './components/Header';
import { calculateDDay } from './utils/dateUtils';
import { 
  ClipboardList, 
  CheckCircle2, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Trash2, 
  Sparkles,
  PartyPopper,
  X
} from 'lucide-react';

// 로컬 스토리지 저장 키 상수
const STORAGE_KEY = 'homework_notice_board_assignments_v1';

// 초기 예시 과제 데이터 (앱 첫 접속 시 안내용)
const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'sample-1',
    subject: '자료구조',
    title: '이진 탐색 트리(BST) 삽입/삭제 알고리즘 구현',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString().slice(0, 16), // 오늘 마감 임박
    memo: '깃허브 리포지토리에 커밋 후 보고서 PDF를 LMS에 제출할 것',
    color: 'yellow',
    createdAt: new Date().toISOString(),
    isCompleted: false,
    rotation: -1.2,
  },
  {
    id: 'sample-2',
    subject: '웹프로그래밍',
    title: 'React 포트폴리오 사이트 컴포넌트 설계서 제출',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 16), // 2일 후 마감
    memo: '반응형 디자인 와이어프레임 첨부 필수',
    color: 'pink',
    createdAt: new Date().toISOString(),
    isCompleted: false,
    rotation: 1.5,
  },
  {
    id: 'sample-3',
    subject: '경영학원론',
    title: '글로벌 기업 ESG 경영 혁신 사례 조사',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 16), // 5일 후 마감
    memo: 'PPT 15장 내외, 팀원별 역할 분담 명시',
    color: 'blue',
    createdAt: new Date().toISOString(),
    isCompleted: false,
    rotation: -0.8,
  },
];

// 토스트 알림 메시지 인터페이스
interface ToastInfo {
  id: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
  undoAction?: () => void;
}

export default function App() {
  // 과제 목록 상태 (로컬 스토리지 연동)
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('로컬스토리지 로딩 에러:', e);
    }
    return INITIAL_ASSIGNMENTS;
  });

  // 현재 활성화된 탭 상태: 'active' (진행 중인 과제) 또는 'completed' (완료된 과제)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // 검색어 필터 상태
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 정렬 기준 상태 (기본: 마감일 임박순)
  const [sortOption, setSortOption] = useState<SortOption>('deadline-asc');

  // 과목 필터 상태 ('all' 또는 특정 과목명)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // 완료 및 삭제 알림 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState<ToastInfo | null>(null);

  // 완료 내역 전체 비우기 모달 상태 (iframe 내 window.confirm 차단 방지)
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  // 과제 목록 변경 시 로컬 스토리지에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error('로컬스토리지 저장 에러:', e);
    }
  }, [assignments]);

  // 토스트 메시지 자동 닫힘 타이머 (4초 후 소멸)
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  /**
   * 새 과제 추가 처리 함수
   * 사용자가 메모지 입력 폼에서 '제출'을 눌렀을 때 호출됨
   */
  const handleAddAssignment = (newAssignmentData: Omit<Assignment, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'rotation'>) => {
    // 자연스러운 포스트잇 각도 랜덤 생성 (-2도 ~ 2도)
    const randomRotation = Number(((Math.random() * 4) - 2).toFixed(1));

    const newAssignment: Assignment = {
      ...newAssignmentData,
      id: `assignment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      isCompleted: false,
      rotation: randomRotation,
    };

    // 새 과제를 목록 맨 앞에 추가
    setAssignments((prev) => [newAssignment, ...prev]);

    // 진행 중 탭으로 자동 이동하여 바로 확인 가능하도록 함
    setActiveTab('active');
  };

  /**
   * 과제 완료 처리 함수
   * 핵심 요구사항: "밑에 완료 버튼을 누르면 없어지고 완료된 과제 탭으로 옮겨짐"
   */
  const handleCompleteAssignment = (id: string) => {
    const target = assignments.find((item) => item.id === id);
    if (!target) return;

    // 해당 과제의 isCompleted를 true로 설정하고 완료 일시 기록
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isCompleted: true, completedAt: new Date().toISOString() }
          : item
      )
    );

    // 완료 축하 토스트 메시지 표시 (완료 탭으로 이동 버튼 및 실행 취소 제공)
    setToastMessage({
      id: `complete-${id}`,
      text: `🎉 "${target.title}" 과제를 완료했습니다!`,
      actionText: '완료 탭 보기',
      onAction: () => setActiveTab('completed'),
      undoAction: () => {
        setAssignments((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, isCompleted: false, completedAt: undefined }
              : item
          )
        );
      },
    });
  };

  /**
   * 과제 복원 함수 (완료된 과제를 다시 진행 중으로 되돌리기)
   */
  const handleRestoreAssignment = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isCompleted: false, completedAt: undefined }
          : item
      )
    );
  };

  /**
   * 과제 개별 삭제 함수
   * iframe 환경에서 차단되는 window.confirm을 제거하고 즉시 삭제 후 '실행 취소(되돌리기)' 토스트 제공
   */
  const handleDeleteAssignment = (id: string) => {
    const target = assignments.find((item) => item.id === id);
    if (!target) return;

    // 과제 목록에서 즉시 제거
    setAssignments((prev) => prev.filter((item) => item.id !== id));

    // 삭제 알림 및 실행 취소 토스트 메시지 표시
    setToastMessage({
      id: `delete-${id}`,
      text: `🗑️ "${target.title}" 메모가 삭제되었습니다.`,
      undoAction: () => {
        // 원래 목록으로 복원
        setAssignments((prev) => [target, ...prev]);
      },
    });
  };

  /**
   * 과제 정보 수정 처리 함수
   */
  const handleUpdateAssignment = (id: string, updatedFields: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  /**
   * 완료된 과제 전체 비우기 함수 (모달 열기)
   */
  const handleOpenClearModal = () => {
    setShowClearModal(true);
  };

  /**
   * 완료된 과제 전체 비우기 실행 함수
   */
  const handleConfirmClearCompleted = () => {
    setAssignments((prev) => prev.filter((item) => !item.isCompleted));
    setShowClearModal(false);
    setToastMessage({
      id: 'cleared-all',
      text: '완료된 과제 내역을 모두 비웠습니다.',
    });
  };

  // 진행 중인 과제 목록
  const activeAssignments = useMemo(
    () => assignments.filter((item) => !item.isCompleted),
    [assignments]
  );

  // 완료된 과제 목록
  const completedAssignments = useMemo(
    () => assignments.filter((item) => item.isCompleted),
    [assignments]
  );

  // 마감 임박(오늘 또는 내일 마감) 과제 수 계산
  const urgentCount = useMemo(() => {
    return activeAssignments.filter((item) => {
      const dday = calculateDDay(item.deadline);
      return dday.isUrgent;
    }).length;
  }, [activeAssignments]);

  // 등록된 모든 고유 과목명 목록 (과목 필터링용)
  const uniqueSubjects = useMemo(() => {
    const subs = assignments.map((item) => item.subject.trim());
    return Array.from(new Set(subs)).filter(Boolean);
  }, [assignments]);

  // 현재 활성 탭 및 검색어/정렬 기준에 따른 표시 과제 목록 필터링
  const displayedAssignments = useMemo(() => {
    const currentList = activeTab === 'active' ? activeAssignments : completedAssignments;

    return currentList
      .filter((item) => {
        // 과목 필터 적용
        if (selectedSubjectFilter !== 'all' && item.subject !== selectedSubjectFilter) {
          return false;
        }
        // 검색어 필터 적용 (과제명, 과목명, 메모 내용 검색)
        if (searchKeyword.trim()) {
          const kw = searchKeyword.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(kw);
          const matchSubject = item.subject.toLowerCase().includes(kw);
          const matchMemo = item.memo?.toLowerCase().includes(kw) ?? false;
          return matchTitle || matchSubject || matchMemo;
        }
        return true;
      })
      .sort((a, b) => {
        // 정렬 옵션 적용
        if (sortOption === 'deadline-asc') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortOption === 'deadline-desc') {
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
        if (sortOption === 'created-desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'subject') {
          return a.subject.localeCompare(b.subject, 'ko');
        }
        return 0;
      });
  }, [activeTab, activeAssignments, completedAssignments, selectedSubjectFilter, searchKeyword, sortOption]);

  return (
    <div className="min-h-screen board-bg flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* 1. 상단 글로벌 헤더 및 통계 */}
      <Header
        activeCount={activeAssignments.length}
        completedCount={completedAssignments.length}
        urgentCount={urgentCount}
      />

      {/* 완료 및 삭제 알림 플로팅 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-stone-700 animate-slide-up">
          <div className="flex items-center gap-2.5">
            <PartyPopper className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm font-medium">{toastMessage.text}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 실행 취소(되돌리기) 액션 버튼 */}
            {toastMessage.undoAction && (
              <button
                type="button"
                onClick={() => {
                  toastMessage.undoAction?.();
                  setToastMessage(null);
                }}
                className="text-xs px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-lg transition-colors cursor-pointer"
              >
                실행 취소
              </button>
            )}

            {/* 일반 액션 버튼 (예: 완료 탭 보기) */}
            {toastMessage.onAction && toastMessage.actionText && (
              <button
                type="button"
                onClick={() => {
                  toastMessage.onAction?.();
                  setToastMessage(null);
                }}
                className="text-xs px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {toastMessage.actionText}
              </button>
            )}

            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 완료 내역 전체 삭제 확인 모달 (iframe 내 window.confirm 대신 사용) */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-scale-in">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">완료 내역 전체 비우기</h3>
            </div>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              완료된 과제 <span className="font-bold text-stone-900">{completedAssignments.length}개</span>를 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmClearCompleted}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                모두 삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 좌측 패널: 과제 입력 메모지 (요구사항: 과목 이름, 과제명, 제출 기한 입력) */}
          <div className="lg:col-span-4 sticky lg:top-24 z-20">
            <AssignmentForm
              onAddAssignment={handleAddAssignment}
              existingSubjects={uniqueSubjects}
            />

            {/* 작은 도움말 카드 */}
            <div className="mt-4 p-4 rounded-xl bg-amber-100/60 border border-amber-200/80 text-xs text-stone-600 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>스마트 과제 관리 팁</span>
              </div>
              <p>• 메모지를 작성하고 제출하면 우측 게시판에 바로 부착됩니다.</p>
              <p>• 과제를 마쳤다면 메모지 하단의 <strong>[과제 완료]</strong> 버튼을 눌러보세요.</p>
              <p>• 완료된 과제는 '완료된 과제' 탭에서 언제든 다시 되돌릴 수 있습니다.</p>
            </div>
          </div>

          {/* 우측 패널: 메모지 알림 게시판 & 탭 & 검색/필터 */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 탭 및 필터 툴바 */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col gap-4">
              
              {/* 상단 탭 스위처: 진행 중 과제 vs 완료된 과제 */}
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-stone-200/70 pb-3.5">
                <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
                  {/* 진행 중인 과제 탭 버튼 */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'active'
                        ? 'bg-white text-stone-900 shadow-sm scale-102'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    <span>진행 중 과제</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === 'active'
                          ? 'bg-amber-100 text-amber-800 font-black'
                          : 'bg-stone-200 text-stone-600 font-semibold'
                      }`}
                    >
                      {activeAssignments.length}
                    </span>
                  </button>

                  {/* 완료된 과제 탭 버튼 */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('completed')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'completed'
                        ? 'bg-white text-stone-900 shadow-sm scale-102'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>완료된 과제</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 font-black'
                          : 'bg-stone-200 text-stone-600 font-semibold'
                      }`}
                    >
                      {completedAssignments.length}
                    </span>
                  </button>
                </div>

                {/* 완료 탭일 때: 전체 삭제 버튼 (인앱 확인 모달 오픈) */}
                {activeTab === 'completed' && completedAssignments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenClearModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>완료 내역 모두 비우기</span>
                  </button>
                )}
              </div>

              {/* 검색 및 필터 컨트롤 바 (모든 input/select에 명시적 label 연결 필수 조건 준수) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                
                {/* 1. 검색어 입력 필드 (label - input 연결 완료) */}
                <div className="sm:col-span-6 relative">
                  <label htmlFor="search-keyword-input" className="sr-only">
                    과제 및 과목 검색
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="search-keyword-input"
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="과제명, 과목, 메모 내용 검색..."
                      className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                    />
                    {searchKeyword && (
                      <button
                        type="button"
                        onClick={() => setSearchKeyword('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                        title="검색어 지우기"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. 과목 필터 선택 (label - select 연결 완료) */}
                <div className="sm:col-span-3">
                  <label htmlFor="filter-subject-select" className="sr-only">
                    과목별 필터 선택
                  </label>
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="filter-subject-select"
                      value={selectedSubjectFilter}
                      onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                      className="w-full pl-8 pr-6 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
                    >
                      <option value="all">모든 과목 보기</option>
                      {uniqueSubjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. 정렬 기준 선택 (label - select 연결 완료) */}
                <div className="sm:col-span-3">
                  <label htmlFor="sort-order-select" className="sr-only">
                    정렬 기준 선택
                  </label>
                  <div className="relative">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="sort-order-select"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-full pl-8 pr-6 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
                    >
                      <option value="deadline-asc">마감일 임박순</option>
                      <option value="deadline-desc">마감일 늦은순</option>
                      <option value="created-desc">최신 등록순</option>
                      <option value="subject">과목명 가나다순</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 과제 메모지 그리드 게시판 영역 */}
            {displayedAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {displayedAssignments.map((assignment) => (
                  activeTab === 'active' ? (
                    // 진행 중인 과제 메모지 카드 (하단 완료 버튼 클릭 시 사라지고 완료 탭으로 이동)
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onComplete={handleCompleteAssignment}
                      onDelete={handleDeleteAssignment}
                      onUpdate={handleUpdateAssignment}
                    />
                  ) : (
                    // 완료된 과제 카드 (되돌리기 및 완전 삭제 기능)
                    <CompletedAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onRestore={handleRestoreAssignment}
                      onPermanentDelete={handleDeleteAssignment}
                    />
                  )
                ))}
              </div>
            ) : (
              // 빈 상태 (등록된 과제 또는 검색 결과가 없을 때)
              <div className="p-12 text-center bg-white/70 backdrop-blur-xs rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl">
                  {activeTab === 'active' ? '📌' : '🎉'}
                </div>
                <h3 className="text-lg font-bold text-stone-800">
                  {activeTab === 'active'
                    ? searchKeyword || selectedSubjectFilter !== 'all'
                      ? '일치하는 과제가 없습니다'
                      : '등록된 진행 중 과제가 없습니다'
                    : '아직 완료된 과제가 없습니다'}
                </h3>
                <p className="text-sm text-stone-500 max-w-sm">
                  {activeTab === 'active'
                    ? searchKeyword || selectedSubjectFilter !== 'all'
                      ? '검색어나 과목 필터를 재설정해 보세요.'
                      : '왼쪽 메모지에서 과목과 과제명을 입력하고 등록해 보세요!'
                    : '과제를 마치고 메모지 아래의 [과제 완료] 버튼을 누르면 여기에 차곡차곡 쌓입니다.'}
                </p>
                {(searchKeyword || selectedSubjectFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedSubjectFilter('all');
                    }}
                    className="mt-2 px-4 py-1.5 text-xs font-bold text-stone-700 bg-stone-200/80 hover:bg-stone-300 rounded-xl transition-colors cursor-pointer"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. 하단 푸터 */}
      <footer className="w-full border-t border-stone-200/80 bg-white/50 py-4 text-center text-xs text-stone-500">
        <p>과제 알림 게시판 • 메모지 스타일로 편리하게 과제 일정을 관리하세요</p>
      </footer>
    </div>
  );
}
