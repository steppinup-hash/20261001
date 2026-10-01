/**
 * 상단 헤더 및 통계 컴포넌트
 * 필수 조건: 모든 입력 컨트롤에 label 태그 연결, 한국어 주석 작성
 */

import React from 'react';
import { Bell, CheckSquare, Clock3, Flame } from 'lucide-react';

interface HeaderProps {
  // 전체 진행 중인 과제 수
  activeCount: number;
  // 완료된 과제 수
  completedCount: number;
  // 마감 임박(오늘 또는 내일) 과제 수
  urgentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  completedCount,
  urgentCount,
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200/80 shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 서비스 타이틀 영역 */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5 text-stone-900 animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>과제 알림 게시판</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  메모지 보드
                </span>
              </h1>
              <p className="text-xs text-stone-500 hidden sm:block">
                과목별 과제와 제출 기한을 메모지로 등록하고 실시간 알림 관리
              </p>
            </div>
          </div>
        </div>

        {/* 요약 통계 뱃지 영역 */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0">
          {/* 진행 중 과제 수 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 text-xs font-semibold shadow-2xs shrink-0">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            <span>진행 중</span>
            <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
              {activeCount}
            </span>
          </div>

          {/* 마감 임박 과제 수 */}
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shadow-2xs shrink-0 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>마감 임박</span>
              <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {urgentCount}
              </span>
            </div>
          )}

          {/* 완료된 과제 수 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-stone-800 text-xs font-semibold shadow-2xs shrink-0">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>완료됨</span>
            <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">
              {completedCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
