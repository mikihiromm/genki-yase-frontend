'use client';
import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

type AnalysisResult = {
  dishes: string[];
  totalCalories: number;
  protein: number;
  salt: number;
  carbs: number;
  fat: number;
  advice: string;
  caution: string;
  confidence: string;
};

const todayStr = () => new Date().toISOString().split('T')[0];

const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  return `${d.getMonth()+1}月${d.getDate()}日`;
};

export default function MealsPage() {
  const [step, setStep] = useState<'select' | 'analyzing' | 'result' | 'saved'>('select');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mealType, setMealType] = useState('朝ごはん');
  const [mealDate, setMealDate] = useState(todayStr());
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const analyze = async (file: File) => {
    setStep('analyzing');
    setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append('photo', file);
    try {
      const res = await fetch(`${API}/api/meals/analyze`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.data);
      setStep('result');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '分析に失敗しました');
      setStep('select');
    }
  };

  const save = async () => {
    if (!result) return;
    const res = await fetch(`${API}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID, mealType, dishes: result.dishes,
        calories: result.totalCalories, protein: result.protein,
        salt: result.salt, carbs: result.carbs, fat: result.fat, mealDate,
      }),
    });
    if (res.ok) setStep('saved');
    else setError('保存に失敗しました。もう一度お試しください。');
  };

  // 過去7日分の日付リストを生成
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div style={{ background: '#185FA5' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">食事を記録する</h1>
      </div>

      <div className="flex-1 px-4 py-4">
        {step === 'select' && (
          <div className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

            {/* 日付選択 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">📅 いつの食事ですか？</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dateOptions.map(d => (
                  <button key={d} onClick={() => setMealDate(d)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${mealDate === d ? 'border-[#185FA5] text-[#185FA5] bg-blue-50' : 'border-gray-200 text-gray-600'}`}>
                    {formatDateLabel(d)}
                  </button>
                ))}
              </div>
            </div>

            {/* 食事種別 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">食事の種類</p>
              <div className="grid grid-cols-2 gap-2">
                {['朝ごはん','昼ごはん','夜ごはん','間食'].map(t => (
                  <button key={t} onClick={() => setMealType(t)}
                    className={`py-2 rounded-xl text-sm font-medium border transition-colors ${mealType === t ? 'border-[#185FA5] text-[#185FA5] bg-blue-50' : 'border-gray-200 text-gray-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center">
              <p className="text-5xl mb-3">📷</p>
              <p className="font-medium text-[#185FA5] text-lg mb-1">食事の写真を選ぶ</p>
              <p className="text-sm text-gray-400 mb-4">真上から撮ると精度が上がります</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => e.target.files?.[0] && analyze(e.target.files[0])} />
                <span className="inline-block bg-[#185FA5] text-white px-6 py-3 rounded-xl text-sm font-medium">カメラで撮る</span>
              </label>
              <label className="cursor-pointer block mt-2">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && analyze(e.target.files[0])} />
                <span className="inline-block border border-[#185FA5] text-[#185FA5] px-6 py-3 rounded-xl text-sm font-medium">アルバムから選ぶ</span>
              </label>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="space-y-4">
            {preview && <img src={preview} alt="食事写真" className="w-full rounded-2xl object-cover h-48" />}
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-4xl mb-3 animate-bounce">🤖</p>
              <p className="font-medium text-lg mb-1">AIが分析しています</p>
              <p className="text-sm text-gray-400">料理名・カロリーを計算中…</p>
              <p className="text-xs text-gray-300 mt-2">約3〜5秒かかります</p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-4">
            {preview && <img src={preview} alt="食事写真" className="w-full rounded-2xl object-cover h-48" />}
            <div className="bg-blue-50 rounded-xl px-4 py-2 text-sm text-[#185FA5] font-medium">
              📅 {formatDateLabel(mealDate)}の{mealType}として保存します
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-400 mb-1">認識した料理</p>
              <p className="font-medium text-base">{result.dishes.join('・')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-400 mb-3">栄養素（推定）</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'カロリー', val: `${result.totalCalories} kcal`, color: '#185FA5' },
                  { label: '塩分', val: `${result.salt} g`, color: result.salt > 3 ? '#e00' : '#0F6E56' },
                  { label: 'タンパク質', val: `${result.protein} g`, color: '#185FA5' },
                  { label: '炭水化物', val: `${result.carbs} g`, color: '#185FA5' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-medium text-base" style={{ color: item.color }}>{item.val}</p>
                  </div>
                ))}
              </div>
              {result.advice && <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-[#185FA5]">💡 {result.advice}</div>}
              {result.caution && <div className="mt-2 bg-red-50 rounded-xl p-3 text-sm text-red-500">⚠️ {result.caution}</div>}
              <p className="text-xs text-gray-300 mt-2">※AIの推定値です</p>
            </div>
            {error && <div className="bg-red-50 text-red-500 rounded-xl p-3 text-sm">{error}</div>}
            <button onClick={save} className="w-full bg-[#185FA5] text-white py-4 rounded-2xl font-medium text-base">✓ 保存する</button>
            <button onClick={() => { setStep('select'); setResult(null); setPreview(''); }}
              className="w-full border border-gray-200 text-gray-500 py-3 rounded-2xl text-sm">撮り直す</button>
          </div>
        )}

        {step === 'saved' && (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
            <p className="text-6xl">✅</p>
            <p className="text-xl font-medium">記録しました！</p>
            <p className="text-gray-400 text-sm">{formatDateLabel(mealDate)}の{mealType}を保存しました</p>
            <Link href="/" className="mt-4 bg-[#185FA5] text-white px-8 py-3 rounded-xl font-medium">ホームに戻る</Link>
            <button onClick={() => { setStep('select'); setResult(null); setPreview(''); }}
              className="border border-gray-200 text-gray-500 px-8 py-3 rounded-xl text-sm">続けて記録する</button>
          </div>
        )}
      </div>
    </div>
  );
}
