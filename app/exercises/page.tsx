'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

type Exercise = { id: number; name: string; duration: number; level: string; category: string; description: string; };

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState('すべて');
  const [done, setDone] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/exercises`)
      .then(r => r.json())
      .then(d => { if (d.success) setExercises(d.exercises); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const complete = async (ex: Exercise) => {
    setDone(prev => [...prev, ex.id]);
    await fetch(`${API}/api/exercises/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, exerciseId: ex.id, durationMinutes: ex.duration, completedAt: new Date().toISOString() }),
    }).catch(() => {});
  };

  const categories = ['すべて', '椅子体操', '柔軟', '筋力', '有酸素'];
  const filtered = filter === 'すべて' ? exercises : exercises.filter(e => e.category === filter);
  const levelColor = (l: string) => l === '初級' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700';

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div style={{ background: '#0F6E56' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">体操メニュー</h1>
      </div>

      {/* カテゴリフィルター */}
      <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === c ? 'bg-[#0F6E56] text-white' : 'bg-gray-100 text-gray-500'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {loading && <p className="text-center text-gray-400 py-8">読み込み中…</p>}
        {filtered.map(ex => (
          <div key={ex.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor(ex.level)}`}>{ex.level}</span>
                  <span className="text-xs text-gray-400">{ex.category}</span>
                </div>
                <p className="font-medium text-base">{ex.name}</p>
                <p className="text-sm text-gray-400 mt-1">{ex.description}</p>
                <p className="text-xs text-gray-300 mt-1">⏱ 約{ex.duration}分</p>
              </div>
              <button onClick={() => !done.includes(ex.id) && complete(ex)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${done.includes(ex.id) ? 'bg-green-100' : 'bg-gray-100 active:scale-90'}`}>
                {done.includes(ex.id) ? '✅' : '▶'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-medium">{done.length}種類完了！お疲れさまでした 🎉</p>
          </div>
        </div>
      )}
    </div>
  );
}
