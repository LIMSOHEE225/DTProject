import React from 'react';
import { BrainCircuit, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const AiAnalysisReport = ({ data }) => {
  if (!data) return <div className="p-8 text-slate-400 text-center">리포트를 불러오는 중...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-w-2xl w-full">
      <div className="bg-gradient-to-r from-aijoa-blue to-blue-400 p-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <BrainCircuit className="text-aijoa-yellow animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest text-blue-100">AI Monthly Learning Report</span>
        </div>
        <h3 className="text-3xl font-black mb-1">학습 진단 리포트</h3>
        <p className="opacity-80 font-medium">홍길동 학생의 4월 학습 분석 결과입니다.</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Status Score Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">학습 완성도</p>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-black text-aijoa-blue">{data.completionRate}%</span>
              <TrendingUp className="text-green-500 mb-1" size={20} />
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">취약점 분석</p>
            <div className="flex items-end space-x-2">
              <span className="text-xl font-bold text-slate-700">분수 연산</span>
              <AlertCircle className="text-aijoa-yellow mb-1" size={20} />
            </div>
          </div>
        </div>

        {/* AI Feedback Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-800 flex items-center space-x-2">
            <div className="w-1.5 h-4 bg-aijoa-yellow rounded-full"></div>
            <span>AI 맞춤 가이드</span>
          </h4>
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative">
            <span className="absolute -top-3 left-6 bg-white px-2 py-1 rounded-md text-[10px] font-bold text-aijoa-blue border border-blue-100 shadow-sm">
              TEACHER ADVISORY
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              "{data.aiFeedback}"
            </p>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-black text-slate-800">추천 복습 문제</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="text-aijoa-blue" size={20} />
                <span className="font-bold text-slate-700">분수의 곱셈 기초 (1단계)</span>
              </div>
              <span className="text-xs font-bold text-slate-400">10문항</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-200 rounded-full"></div>
                <span>분수의 나눗셈 심화 (2단계)</span>
              </div>
              <span className="text-xs font-bold text-slate-300">잠김</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
        <button className="text-aijoa-blue font-black text-sm hover:underline decoration-2 underline-offset-4">상세 분석 리포트 PDF 다운로드</button>
      </div>
    </div>
  );
};

export default AiAnalysisReport;
