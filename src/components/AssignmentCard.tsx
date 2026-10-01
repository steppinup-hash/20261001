/**
 * 진행 중인 과제 메모지 컴포넌트
 * 요구사항:
 * - 메모지 형태로 표시
 * - 밑에 '완료' 버튼을 누르면 목록에서 사라지고 '완료된 과제' 탭으로 이동
 * - 한국어 주석 작성
 */

import React, { useState } from 'react';
import { Check, Trash2, Calendar, Clock, AlertCircle, Edit3, X, Save } from 'lucide-react';
import { Assignment, MemoColor } from '../types';
import { calculateDDay, formatKoreanDateTime } from '../utils/dateUtils';

interface AssignmentCardProps {
  // 과제 데이터 객체
  assignment: Assignment;
  // 과제 완료 처리 함수 ('완료된 과제' 탭으로 이동)
  onComplete: (id: string) => void;
  // 과제 삭제 처리 함수
  onDelete: (id: string) => void;
  // 과제 수정 처리 함수
  onUpdate?: (id: string, updated: Partial<Assignment>) => void;
}

// 메모지 테마별 스타일 매핑
const COLOR_THEMES: Record<MemoColor, {
  bg: string;
  border: string;
  pin: string;
  badge: string;
  button: string;
}> = {
  yellow: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    pin: 'bg-amber-500',
    badge: 'bg-amber-200/80 text-amber-900 border-amber-300',
    button: 'bg-amber-800 hover:bg-amber-900 text-amber-50',
  },
  pink: {
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    pin: 'bg-rose-500',
    badge: 'bg-rose-200/80 text-rose-900 border-rose-300',
    button: 'bg-rose-800 hover:bg-rose-900 text-rose-50',
  },
  blue: {
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    pin: 'bg-sky-500',
    badge: 'bg-sky-200/80 text-sky-900 border-sky-300',
    button: 'bg-sky-800 hover:bg-sky-900 text-sky-50',
  },
  green: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    pin: 'bg-emerald-500',
    badge: 'bg-emerald-200/80 text-emerald-900 border-emerald-300',
    button: 'bg-emerald-800 hover:bg-emerald-900 text-emerald-50',
  },
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    pin: 'bg-purple-500',
    badge: 'bg-purple-200/80 text-purple-900 border-purple-300',
    button: 'bg-purple-800 hover:bg-purple-900 text-purple-50',
  },
};

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onComplete,
  onDelete,
  onUpdate,
}) => {
  // 인라인 수정 모드 활성화 여부
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState<string>(assignment.subject);
  const [editTitle, setEditTitle] = useState<string>(assignment.title);
  const [editDeadline, setEditDeadline] = useState<string>(assignment.deadline);
  const [editMemo, setEditMemo] = useState<string>(assignment.memo || '');

  // 완료 버튼 애니메이션 진행 상태
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  // 마감일 D-Day 계산 결과
  const ddayInfo = calculateDDay(assignment.deadline);

  // 메모지 색상 테마 가져오기
  const theme = COLOR_THEMES[assignment.color] || COLOR_THEMES.yellow;

  // 메모지 살짝 기울어진 각도 (자연스러운 포스트잇 효과)
  const rotationDeg = assignment.rotation ?? 0;

  /**
   * 완료 버튼 클릭 시 처리 핸들러
   * 사용자 요구사항: "밑에 완료 버튼을 누르면 없어지고 완료된 과제 탭으로 옮겨짐"
   */
  const handleCompleteClick = () => {
    setIsFinishing(true);
    // 자연스러운 사라짐 애니메이션 후 상태 변경
    setTimeout(() => {
      onComplete(assignment.id);
    }, 280);
  };

  /**
   * 수정 저장 핸들러
   */
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(assignment.id, {
        subject: editSubject.trim() || assignment.subject,
        title: editTitle.trim() || assignment.title,
        deadline: editDeadline,
        memo: editMemo.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  return (
    <div
      style={{
        transform: `rotate(${rotationDeg}deg)`,
      }}
      className={`relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border-2 ${theme.border} ${theme.bg} shadow-md hover:shadow-xl transition-all duration-300 min-h-[260px] ${
        isFinishing ? 'scale-90 opacity-0 -translate-y-4' : 'scale-100 opacity-100'
      }`}
    >
      {/* 메모지 상단 핀 장식 */}
      <div className={`pushpin ${theme.pin}`}></div>

      {/* 카드 상단 영역: 과목명 & D-Day 뱃지 & 액션 */}
      <div>
        <div className="flex items-start justify-between gap-2 pt-2 mb-3">
          {/* 과목 이름 태그 */}
          <span
            className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${theme.badge} truncate max-w-[130px] shadow-xs`}
            title={assignment.subject}
          >
            {assignment.subject}
          </span>

          <div className="flex items-center gap-1.5">
            {/* D-Day 상태 뱃지 */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full shadow-xs ${
                ddayInfo.isOverdue
                  ? 'bg-rose-500 text-white animate-pulse'
                  : ddayInfo.isUrgent
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {ddayInfo.isUrgent && <AlertCircle className="w-3 h-3" />}
              {ddayInfo.label}
            </span>

            {/* 수정 모드 토글 버튼 */}
            {!isEditing && onUpdate && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                title="과제 메모 수정"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* 삭제 버튼: 클릭 시 즉시 과제 삭제 수행 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(assignment.id);
              }}
              className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-100/70 rounded-lg transition-colors cursor-pointer"
              title="메모지 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 과제 내용 영역 (일반 보기 모드 / 인라인 수정 모드) */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-2 mb-3">
            <div>
              <label htmlFor={`edit-subject-${assignment.id}`} className="sr-only">과목 수정</label>
              <input
                id={`edit-subject-${assignment.id}`}
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="과목명"
                className="w-full text-xs font-semibold px-2 py-1 bg-white/90 border border-stone-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor={`edit-title-${assignment.id}`} className="sr-only">과제명 수정</label>
              <input
                id={`edit-title-${assignment.id}`}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="과제명"
                className="w-full text-sm font-bold px-2 py-1 bg-white/90 border border-stone-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor={`edit-deadline-${assignment.id}`} className="sr-only">기한 수정</label>
              <input
                id={`edit-deadline-${assignment.id}`}
                type="datetime-local"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="w-full text-xs px-2 py-1 bg-white/90 border border-stone-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor={`edit-memo-${assignment.id}`} className="sr-only">메모 수정</label>
              <textarea
                id={`edit-memo-${assignment.id}`}
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                placeholder="추가 메모"
                rows={2}
                className="w-full text-xs px-2 py-1 bg-white/90 border border-stone-300 rounded resize-none"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-xs bg-stone-200 hover:bg-stone-300 rounded text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> 취소
              </button>
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-stone-800 hover:bg-stone-900 rounded text-white flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3 h-3" /> 저장
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2.5">
            {/* 과제 제목 */}
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug break-words">
              {assignment.title}
            </h3>

            {/* 마감 일시 정보 */}
            <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate">{formatKoreanDateTime(assignment.deadline)}</span>
            </div>

            {/* 추가 메모 내용 */}
            {assignment.memo && (
              <div className="mt-2 p-2.5 bg-white/60 rounded-xl border border-black/5 text-xs text-stone-700 leading-relaxed break-words whitespace-pre-wrap">
                {assignment.memo}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 카드 하단 완료 버튼 영역 (핵심 요구사항) */}
      <div className="pt-4 mt-3 border-t border-black/10">
        <button
          type="button"
          onClick={handleCompleteClick}
          className="w-full py-2.5 px-3 bg-stone-900 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </span>
          <span>과제 완료</span>
        </button>
      </div>
    </div>
  );
};
