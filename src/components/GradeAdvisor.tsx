'use client';

import React from 'react';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

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
    { num: 1, label: 'ថ្នាក់ទី ១', colorName: 'ពណ៌ខៀវ', colorBg: 'bg-blue-600', dotBg: 'bg-blue-500', colorCode: 'blue' },
    { num: 2, label: 'ថ្នាក់ទី ២', colorName: 'ពណ៌ខៀវ', colorBg: 'bg-blue-600', dotBg: 'bg-blue-500', colorCode: 'blue' },
    { num: 3, label: 'ថ្នាក់ទី ៣', colorName: 'ពណ៌ទឹកក្រូច', colorBg: 'bg-amber-500', dotBg: 'bg-amber-500', colorCode: 'orange' },
    { num: 4, label: 'ថ្នាក់ទី ៤', colorName: 'ពណ៌ទឹកក្រូច', colorBg: 'bg-amber-500', dotBg: 'bg-amber-500', colorCode: 'orange' },
    { num: 5, label: 'ថ្នាក់ទី ៥', colorName: 'ពណ៌បៃតង', colorBg: 'bg-emerald-600', dotBg: 'bg-emerald-500', colorCode: 'green' },
    { num: 6, label: 'ថ្នាក់ទី ៦', colorName: 'ពណ៌បៃតង', colorBg: 'bg-emerald-600', dotBg: 'bg-emerald-500', colorCode: 'green' },
  ];

  const activeGradeObj = grades.find(g => g.num === selectedGrade) || grades[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 my-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-school-50 text-school-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-school-600" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
              ជ្រើសរើសកម្រិតថ្នាក់កូនរបស់អ្នក
            </h3>
            <p className="text-xs text-slate-500">
              ប្រព័ន្ធនឹងបង្ហាញពណ៌ និងទំហំផ្លូវការដោយស្វ័យប្រវត្តិ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onScrollToCatalog}
          className="self-start sm:self-center text-xs font-bold text-school-700 hover:text-school-800 bg-school-50 hover:bg-school-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
        >
          <span>មើលបញ្ជីទំនិញ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grade Selector Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3.5">
        {grades.map((grade) => {
          const isSelected = grade.num === selectedGrade;
          return (
            <button
              key={grade.num}
              type="button"
              onClick={() => onSelectGrade(grade.num)}
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-school-700 text-white border-school-700 shadow-sm shadow-school-900/20 ring-2 ring-school-400 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${grade.dotBg} shrink-0`} />
                <span className="text-xs sm:text-sm">{grade.label}</span>
              </div>
              <span
                className={`text-[10px] mt-0.5 ${
                  isSelected ? 'text-amber-200 font-bold' : 'text-slate-500'
                }`}
              >
                {grade.colorName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Grade Live Helper Banner */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-slate-800 font-bold">
            កូនរៀន{activeGradeObj.label} ➔ ឈុតកីឡា ({activeGradeObj.colorName}) & ខ្សែពាក់កាត ({activeGradeObj.colorName})
          </span>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200 self-start sm:self-auto">
          🟢 មានស្តុកគ្រប់ទំហំនៅបញ្ជរ
        </div>
      </div>
    </div>
  );
};
