'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

export default function Home() {
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, salt: 0 });
  const [goal, setGoal] = useState({ calorieGoal: 1600, saltGoal: 7.0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 10) setGreeting('おはようございます');
    else if (h < 17) setGreeting('こんにちは');
    else setGreeting('こんばんは');

    fetch(`${API}/api/meals/${USER_ID}/${today}`)
      .then(r => r.json()).then(d => { if (d.success) setTotals(d.totals); }).catch(() => {});
    fetch(`${API}/api/goals/${USER_ID}`)
      .then(r => r.json()).then(d => { if (d.success) setGoal(d.goals); }).catch(() => {});
  }, [today]);

  const progress = Math.min(Math.round((totals.calories / goal.calorieGoal) * 100), 100);
  const dateStr = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div style={{ background: '#185FA5' }} className="px-5 pt-10 pb-6 text-white">
        <p className="text-sm opacity-80">{dateStr}</p>
        <h1 className="text-2xl font-medium mt-1">{greeting} 👋</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* カロリー進捗 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">今日のカロリー</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-medium" style={{ color: '#185FA5' }}>{totals.calories.toLocaleString()}</span>
            <span className="text-gray-400 mb-1">/ {goal.calorieGoal.toLocaleString()} kcal</span>
          </div>
          <div className="bg-blue-100 rounded-full h-3">
            <div className="h-3 rounded-full transition-all" style={{ width: `${progress}%`, background: '#185FA5' }} />
          </div>
          <p className="text-right text-xs mt-1" style={{ color: '#185FA5' }}>{progress}%</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-gray-500">タンパク質 <b className="text-gray-800">{totals.protein}g</b></span>
            <span className="text-gray-500">塩分 <b className={totals.salt > goal.saltGoal ? 'text-red-500' : 'text-gray-800'}>{totals.salt}g</b></span>
          </div>
        </div>

        {/* メニュー */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/meals" className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span className="text-4xl">📷</span>
            <span className="font-medium text-sm">食事を記録</span>
            <span className="text-xs text-gray-400">写真で簡単入力</span>
          </Link>
          <Link href="/exercises" className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span className="text-4xl">🧘</span>
            <span className="font-medium text-sm">体操する</span>
            <span className="text-xs text-gray-400">今日のメニュー</span>
          </Link>
          <Link href="/health" className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span className="text-4xl">❤️</span>
            <span className="font-medium text-sm">体重・血圧</span>
            <span className="text-xs text-gray-400">健康メモ</span>
          </Link>
          <Link href="/goals" className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span className="text-4xl">🎯</span>
            <span className="font-medium text-sm">目標設定</span>
            <span className="text-xs text-gray-400">カロリー目標</span>
          </Link>
          <Link href="/history" className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span className="text-4xl">📋</span>
            <span className="font-medium text-sm">食事の履歴</span>
            <span className="text-xs text-gray-400">AIアドバイス付き</span>
          </Link>
          <Link href="/menu" className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <span className="text-4xl">🛒</span>
            <span className="font-medium text-sm">献立を作る</span>
            <span className="text-xs text-gray-400">買い物写真から1週間分</span>
          </Link>
        </div>
      </div>

      {/* タブバー */}
      <nav className="bg-white border-t border-gray-100 flex">
        <Link href="/" className="flex-1 flex flex-col items-center py-3 gap-1" style={{ color: '#185FA5' }}>
          <span className="text-xl">🏠</span><span className="text-xs font-medium">ホーム</span>
        </Link>
        <Link href="/meals" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400">
          <span className="text-xl">📷</span><span className="text-xs">食事</span>
        </Link>
        <Link href="/exercises" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400">
          <span className="text-xl">🧘</span><span className="text-xs">体操</span>
        </Link>
        <Link href="/health" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400">
          <span className="text-xl">❤️</span><span className="text-xs">記録</span>
        </Link>
      </nav>
    </div>
  );
}
