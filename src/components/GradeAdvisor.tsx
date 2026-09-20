'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ChevronRight, Palette } from 'lucide-react';

interface GradeAdvisorProps {
  selectedGrade: number;
  onSelectGrade: (grade: number) => void;
  onScrollToCatalog: () => void;
}

export const GradeAdvisor: React.FC<GradeAdvisorProps> = ({
  selectedGrade,
  onSelectGrade,
  onScrollToCatalog,
}) => {
  const grades = [
    { num: 1, label: 'ថ្នាក់ទី ១', colorName: 'ពណ៌ខៀវ', colorBg: 'bg-blue-500', colorCode: 'blue' },
    { num: 2, label: 'ថ្នាក់ទី ២', colorName: 'ពណ៌ខៀវ', colorBg: 'bg-blue-500', colorCode: 'blue' },
    { num: 3, label: 'ថ្នាក់ទី ៣', colorName: 'ពណ៌ទឹកក្រូច', colorBg: 'bg-amber-500', colorCode: 'orange' },
    { num: 4, label: 'ថ្នាក់ទី ៤', colorName: 'ពណ៌ទឹកក្រូច', colorBg: 'bg-amber-500', colorCode: 'orange' },
    { num: 5, label: 'ថ្នាក់ទី ៥', colorName: 'ពណ៌បៃតង', colorBg: 'bg-emerald-600', colorCode: 'green' },
    { num: 6, label: 'ថ្នាក់ទី ៦', colorName: 'ពណ៌បៃតង', colorBg: 'bg-emerald-600', colorCode: 'green' },
  ];

  const activeGradeObj = grades.find(g => g.num === selectedGrade) || grades[0];

  return (
    <div className="bg-gradient-to-r from-school-900 via-school-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-school-950/20 border border-school-700/50 my-6 relative overflow-hidden">
      {/* Glow decorative effects */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ប្រព័ន្ធជំនួយឆ្លាតវៃសម្រាប់អាណាព្យាបាល</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              ជ្រើសរើសកម្រិតថ្នាក់កូនរបស់អ្នក (ថ្នាក់ទី ១ ដល់ ទី ៦)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              ប្រព័ន្ធនឹងកំណត់ពណ៌ផ្លូវការសម្រាប់ <span className="text-amber-300 font-bold">ឈុតកីឡា</span> និង <span className="text-amber-300 font-bold">ប្រអប់កាត/ខ្សែពាក់ក</span> ដោយស្វ័យប្រវត្តិ។
            </p>
          </div>

          <button
            type="button"
            onClick={onScrollToCatalog}
            className="self-start md:self-center bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>មើលទំនិញទាំងអស់</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        {/* Grade Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mt-5">
          {grades.map((grade) => {
            const isSelected = grade.num === selectedGrade;
            return (
              <button
                key={grade.num}
                type="button"
                onClick={() => onSelectGrade(grade.num)}
                className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10 scale-102 font-bold ring-4 ring-white/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${grade.colorBg}`} />
                  <span className="text-xs sm:text-sm">{grade.label}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-school-700 font-bold' : 'text-slate-400'}`}>
                  {grade.colorName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Grade Uniform Checklist Box */}
        <div className="mt-5 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-school-600/50 flex items-center justify-center text-amber-300 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                ឯកសណ្ឋានពេញលេញសម្រាប់ {activeGradeObj.label} ({activeGradeObj.colorName})៖
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>អាវសិស្ស (ប្រុស/ស្រី)</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ខោខ្លី / សំពត់ (ខៀវចាស់)</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ឈុតកីឡា ({activeGradeObj.colorName})</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ប្រអប់កាត & ខ្សែពាក់ក ({activeGradeObj.colorName})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-amber-200 bg-amber-400/10 border border-amber-300/20 px-3 py-1.5 rounded-xl font-medium self-start md:self-auto">
            ⚡ បានជ្រើសពណ៌ត្រឹមត្រូវលើកាតស្វ័យប្រវត្តិ
          </div>
        </div>
      </div>
    </div>
  );
};
