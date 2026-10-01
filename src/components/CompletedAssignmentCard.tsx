/**
 * 완료된 과제 카드 컴포넌트
 * 요구사항:
 * - '완료된 과제' 탭에서 완료 처리된 과제들을 표시
 * - 다시 진행 중으로 복구하거나 영구 삭제하는 기능 제공
 * - 한국어 주석 작성
 */

import React from 'react';
import { RotateCcw, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Assignment } from '../types';
import { formatKoreanDateTime } from '../utils/dateUtils';

interface CompletedAssignmentCardProps {
  // 완료된 과제 데이터
  assignment: Assignment;
  // 다시 진행 중인 과제로 되돌리기
  onRestore: (id: string) => void;
  // 영구 삭제 처리
  onPermanentDelete: (id: string) => void;
}

export const CompletedAssignmentCard: React.FC<CompletedAssignmentCardProps> = ({
  assignment,
  onRestore,
  onPermanentDelete,
}) => {
  return (
    <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-stone-100/90 border-2 border-stone-300 shadow-sm hover:shadow-md transition-all duration-200 min-h-[220px]">
      {/* 완료 도장 스탬프 그래픽 효과 */}
      <div className="absolute top-3 right-4 rotate-12 pointer-events-none select-none">
        <span className="inline-flex items-center gap-1 px-3 py-1 border-2 border-emerald-600 text-emerald-700 text-xs font-black rounded-lg uppercase tracking-wider bg-emerald-50/80 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          완료됨
        </span>
      </div>

      {/* 카드 내용 */}
      <div>
        {/* 과목 태그 */}
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-stone-200 text-stone-700">
            {assignment.subject}
          </span>
        </div>

        {/* 과제 제목 (취소선 효과) */}
        <h3 className="text-base font-bold text-stone-500 line-through decoration-stone-400 leading-snug break-words mb-2">
          {assignment.title}
        </h3>

        {/* 원래 제출 기한 정보 */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Clock className="w-3 h-3 shrink-0" />
          <span>기한: {formatKoreanDateTime(assignment.deadline)}</span>
        </div>

        {/* 완료 일시 정보 */}
        {assignment.completedAt && (
          <div className="mt-1 text-xs text-emerald-700 font-medium">
            완료: {formatKoreanDateTime(assignment.completedAt)}
          </div>
        )}

        {/* 메모가 있었던 경우 */}
        {assignment.memo && (
          <p className="mt-2 text-xs text-stone-400 italic line-through line-clamp-2">
            {assignment.memo}
          </p>
        )}
      </div>

      {/* 하단 액션 버튼 (복원 & 영구 삭제) */}
      <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onRestore(assignment.id)}
          className="flex-1 py-1.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 hover:text-stone-900 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          title="진행 중인 과제로 되돌리기"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>다시 진행하기</span>
        </button>

        <button
          type="button"
          onClick={() => onPermanentDelete(assignment.id)}
          className="py-1.5 px-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="완전 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
