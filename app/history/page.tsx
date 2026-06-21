'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

type Meal = {
  id: number;
  meal_type: string;
  dishes: string[];
  calories: number;
  protein: string;
  salt: string;
  meal_date: string;
};

type Advice = {
  overall: string;
  good: string;
  improve: string;
  tip: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<Record<string, Meal[]>>({});
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchHistory = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/meals/history/${USER_ID}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setHistory(d.history || {});
          setAdvice(d.advice || null);
        } else {
          setError('履歴の取得に失敗しました');
        }
      })
      .catch(() => setError('通信エラーが発生しました'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const deleteMeal = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/api/meals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // ローカルで即時削除
        setHistory(prev => {
          const next: Record<string, Meal[]> = {};
          for (const [date, meals] of Object.entries(prev)) {
            const filtered = meals.filter(m => m.id !== id);
            if (filtered.length > 0) next[date] = filtered;
          }
          return next;
        });
      } else {
        setError('削除に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    const label = diff === 0 ? '今日' : diff === 1 ? '昨日' : `${diff}日前`;
    return `${d.getMonth() + 1}/${d.getDate()}（${['日', '月', '火', '水', '木', '金', '土'][d.getDay()]}）${label}`;
  };

  const dayTotal = (meals: Meal[]) => ({
    cal: meals.reduce((s, m) => s + (m.calories || 0), 0),
    prot: meals.reduce((s, m) => s + parseFloat(m.protein || '0'), 0),
    salt: meals.reduce((s, m) => s + parseFloat(m.salt || '0'), 0),
  });

  const mealIcon: Record<string, string> = {
    '朝ごはん': '🌅', '昼ごはん': '☀️', '夜ごはん': '🌙', '間食': '🍡',
  };

  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gray-50">
      <div style={{ background: '#185FA5' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">食事の履歴</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">⏳</p>
            <p>履歴を読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 rounded-2xl p-4 text-sm">{error}</div>
        )}

        {!loading && dates.length === 0 && !error && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium">まだ食事記録がありません</p>
            <p className="text-sm mt-1">食事を記録すると、ここに履歴が表示されます</p>
            <Link href="/meals" className="mt-4 inline-block bg-[#185FA5] text-white px-6 py-3 rounded-2xl text-sm font-medium">
              食事を記録する
            </Link>
          </div>
        )}

        {/* AIアドバイス */}
        {advice && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-sm font-medium text-blue-700 mb-3">🤖 AIからのアドバイス</p>
            <p className="text-sm text-gray-700 mb-3">{advice.overall}</p>
            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <span className="text-green-500 shrink-0">✅</span>
                <span className="text-gray-600">{advice.good}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-orange-400 shrink-0">💡</span>
                <span className="text-gray-600">{advice.improve}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-blue-400 shrink-0">⭐</span>
                <span className="text-gray-600">{advice.tip}</span>
              </div>
            </div>
          </div>
        )}

        {/* 日付ごとの履歴 */}
        {dates.map(date => {
          const meals = history[date];
          const { cal, prot, salt } = dayTotal(meals);
          return (
            <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-medium text-gray-700 text-sm">{formatDate(date)}</span>
                <span className="text-xs text-gray-400">{cal} kcal</span>
              </div>
              <div className="divide-y divide-gray-50">
                {meals.map(meal => (
                  <div key={meal.id} className="px-4 py-3">
                    {confirmId === meal.id ? (
                      /* 削除確認 */
                      <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3">
                        <p className="flex-1 text-sm text-red-600">この記録を削除しますか？</p>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          disabled={deletingId === meal.id}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                        >
                          {deletingId === meal.id ? '...' : '削除'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0 mt-0.5">{mealIcon[meal.meal_type] || '🍴'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">{meal.meal_type}</p>
                          <p className="text-sm font-medium text-gray-800 leading-tight">
                            {Array.isArray(meal.dishes) ? meal.dishes.join('、') : '記録あり'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {meal.calories}kcal・タンパク質{parseFloat(meal.protein || '0').toFixed(1)}g・塩分{parseFloat(meal.salt || '0').toFixed(1)}g
                          </p>
                        </div>
                        <button
                          onClick={() => setConfirmId(meal.id)}
                          className="shrink-0 text-gray-300 hover:text-red-400 text-xl p-1 transition-colors"
                          aria-label="削除"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-blue-50 flex gap-4 text-xs text-blue-600">
                <span>合計 {cal}kcal</span>
                <span>たんぱく質 {prot.toFixed(1)}g</span>
                <span>塩分 {salt.toFixed(1)}g</span>
              </div>
            </div>
          );
        })}

        {!loading && dates.length > 0 && (
          <Link href="/meals" className="block text-center bg-[#185FA5] text-white py-3 rounded-2xl text-sm font-medium">
            + 食事を記録する
          </Link>
        )}
      </div>
    </div>
  );
}
