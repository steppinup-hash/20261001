/**
 * 과제 입력 폼 컴포넌트 (메모지 스타일)
 * 필수 조건 준수:
 * 1. 모든 input 및 textarea에 label 연결 (htmlFor-id 매칭)
 * 2. 한국어 주석 작성
 */

import React, { useState } from 'react';
import { PlusCircle, Calendar, BookOpen, FileText, Palette, Sparkles } from 'lucide-react';
import { Assignment, MemoColor } from '../types';
import { getDefaultDeadline } from '../utils/dateUtils';

// 색상 옵션 정의 (메모지 배경색 및 라벨명)
const COLOR_OPTIONS: { id: MemoColor; name: string; bgClass: string; borderClass: string }[] = [
  { id: 'yellow', name: '노란 메모지', bgClass: 'bg-amber-100', borderClass: 'border-amber-300' },
  { id: 'pink', name: '분홍 메모지', bgClass: 'bg-rose-100', borderClass: 'border-rose-300' },
  { id: 'blue', name: '하늘 메모지', bgClass: 'bg-sky-100', borderClass: 'border-sky-300' },
  { id: 'green', name: '연초록 메모지', bgClass: 'bg-emerald-100', borderClass: 'border-emerald-300' },
  { id: 'purple', name: '연보라 메모지', bgClass: 'bg-purple-100', borderClass: 'border-purple-300' },
];

// 추천 과목 태그
const SUGGESTED_SUBJECTS = ['자료구조', '웹프로그래밍', '경영학원론', '영어회화', '인공지능', '미적분학'];

interface AssignmentFormProps {
  // 새 과제 추가 완료 시 호출되는 콜백 함수
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'isCompleted' | 'completedAt' | 'rotation'>) => void;
  // 기존 등록된 과목 목록 (자동완성 추천용)
  existingSubjects?: string[];
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  onAddAssignment,
  existingSubjects = [],
}) => {
  // 과목 이름 상태
  const [subject, setSubject] = useState<string>('');
  // 과제명 상태
  const [title, setTitle] = useState<string>('');
  // 제출 기한 상태 (기본값: 3일 후 오후 11:59)
  const [deadline, setDeadline] = useState<string>(getDefaultDeadline());
  // 추가 상세 메모 상태
  const [memo, setMemo] = useState<string>('');
  // 선택된 메모지 색상 테마 상태
  const [selectedColor, setSelectedColor] = useState<MemoColor>('yellow');

  // 에러 메시지 상태 (iframe 환경에서 window.alert 차단 방지)
  const [formError, setFormError] = useState<string | null>(null);

  // 추천 과목 목록 병합 (기존 등록 과목 + 기본 추천)
  const quickSubjects = Array.from(new Set([...existingSubjects, ...SUGGESTED_SUBJECTS])).slice(0, 5);

  /**
   * 폼 제출 처리 핸들러
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    // 유효성 검사
    if (!subject.trim()) {
      setFormError('과목 이름을 입력해주세요.');
      return;
    }
    if (!title.trim()) {
      setFormError('과제명을 입력해주세요.');
      return;
    }
    if (!deadline) {
      setFormError('제출 기한을 설정해주세요.');
      return;
    }

    // 부모 컴포넌트에 새 과제 데이터 전달
    onAddAssignment({
      subject: subject.trim(),
      title: title.trim(),
      deadline,
      memo: memo.trim() || undefined,
      color: selectedColor,
    });

    // 폼 초기화 (과제명, 메모만 초기화하고 과목이나 기한은 편의를 위해 유지하거나 기본값 재설정)
    setTitle('');
    setMemo('');
    setFormError(null);
  };

  // 선택된 색상에 따른 배경색 클래스 매핑
  const currentBgClass = {
    yellow: 'bg-amber-50 border-amber-300 shadow-amber-200/50',
    pink: 'bg-rose-50 border-rose-300 shadow-rose-200/50',
    blue: 'bg-sky-50 border-sky-300 shadow-sky-200/50',
    green: 'bg-emerald-50 border-emerald-300 shadow-emerald-200/50',
    purple: 'bg-purple-50 border-purple-300 shadow-purple-200/50',
  }[selectedColor];

  return (
    <div className="relative w-full">
      {/* 메모지 상단 마스킹 테이프 장식 효과 */}
      <div className="tape-top"></div>

      {/* 메모지 폼 카드 컨테이너 */}
      <div
        className={`relative border-2 rounded-2xl p-6 sm:p-7 shadow-xl transition-all duration-300 ${currentBgClass}`}
      >
        {/* 메모지 헤더 타이틀 */}
        <div className="flex items-center justify-between border-b border-stone-300/70 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-1.5 tracking-tight">
              <span>새 과제 메모 작성</span>
            </h2>
          </div>
          <span className="text-xs font-medium text-stone-500 bg-white/80 px-2.5 py-1 rounded-full border border-stone-200 shadow-xs">
            📝 할 일 기록
          </span>
        </div>

        {/* 과제 등록 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. 과목 이름 입력 필드 (label - input 연결 완료) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="subject-input"
                className="block text-sm font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-stone-600" />
                <span>과목 이름 <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-xs text-stone-400">예: 컴퓨터구조, 회계원리</span>
            </div>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="과목 이름을 입력하세요"
              required
              className="w-full px-3.5 py-2.5 bg-white/90 border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors text-sm font-medium"
            />

            {/* 빠른 과목 태그 선택 버튼들 */}
            {quickSubjects.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-stone-500 mr-1">빠른 선택:</span>
                {quickSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className="text-xs px-2 py-0.5 rounded-lg bg-stone-200/70 hover:bg-stone-300/80 text-stone-700 transition-colors cursor-pointer"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. 과제명 입력 필드 (label - input 연결 완료) */}
          <div>
            <label
              htmlFor="title-input"
              className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-stone-600" />
              <span>과제명 <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 4주차 알고리즘 과제 보고서 제출"
              required
              className="w-full px-3.5 py-2.5 bg-white/90 border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors text-sm font-medium"
            />
          </div>

          {/* 3. 제출 기한 입력 필드 (label - input 연결 완료) */}
          <div>
            <label
              htmlFor="deadline-input"
              className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-stone-600" />
              <span>제출 기한 <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="deadline-input"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white/90 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors text-sm font-medium cursor-pointer"
            />
          </div>

          {/* 4. 추가 메모 입력 필드 (선택) (label - textarea 연결 완료) */}
          <div>
            <label
              htmlFor="memo-input"
              className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-stone-600" />
              <span>추가 메모 <span className="text-xs font-normal text-stone-500">(선택)</span></span>
            </label>
            <textarea
              id="memo-input"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="제출 링크, 첨부파일명 등 참고사항을 적어두세요"
              className="w-full px-3.5 py-2 bg-white/90 border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs transition-colors text-sm resize-none"
            />
          </div>

          {/* 5. 메모지 색상 선택 (모든 input 라디오에 고유 id와 label 연결 완료) */}
          <div className="pt-1">
            <span className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-stone-600" />
              <span>메모지 색상</span>
            </span>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((opt) => {
                const inputId = `color-option-${opt.id}`;
                const isChecked = selectedColor === opt.id;
                return (
                  <div key={opt.id} className="text-center">
                    <input
                      type="radio"
                      id={inputId}
                      name="memo-color-group"
                      value={opt.id}
                      checked={isChecked}
                      onChange={() => setSelectedColor(opt.id)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={inputId}
                      className={`block py-1.5 px-1 rounded-xl text-xs font-semibold cursor-pointer border-2 transition-all ${opt.bgClass} ${
                        isChecked
                          ? `${opt.borderClass} ring-2 ring-stone-700 ring-offset-1 scale-105 shadow-sm text-stone-900`
                          : 'border-transparent text-stone-600 hover:scale-102 opacity-80'
                      }`}
                    >
                      {opt.id === 'yellow' && '노랑'}
                      {opt.id === 'pink' && '분홍'}
                      {opt.id === 'blue' && '하늘'}
                      {opt.id === 'green' && '초록'}
                      {opt.id === 'purple' && '보라'}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 유효성 검사 에러 메시지 표시 */}
          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-1.5 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>{formError}</span>
            </div>
          )}

          {/* 제출 버튼: 입력하고 제출을 누를시 옆에 메모지 형태로 생김 */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-amber-300" />
              <span>과제 등록 (제출)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
