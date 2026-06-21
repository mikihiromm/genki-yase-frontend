'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

type Preset = { key: string; label: string; calories: number; protein: number; salt: number; };

export default function GoalsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const [saved, setSaved] = useState(false);
  const [current, setCurrent] = useState<{calorieGoal: number; saltGoal: number} | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/goals/presets`).then(r => r.json()).then(d => { if (d.success) setPresets(d.presets); }).catch(() => {});
    fetch(`${API}/api/goals/${USER_ID}`).then(r => r.json()).then(d => { if (d.success) setCurrent(d.goals); }).catch(() => {});
  }, []);

  const save = async () => {
    setError('');
    const body = selected ? { presetKey: selected } : { calorieGoal: parseInt(custom) };
    if (!selected && (!custom || parseInt(custom) < 800)) { setError('カロリー目標を800以上で入力してください'); return; }
    const res = await fetch(`${API}/api/goals/${USER_ID}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) { setSaved(true); setCurrent({ calorieGoal: data.goals.calorieGoal, saltGoal: data.goals.saltGoal }); }
    else setError(data.error || '設定に失敗しました');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div style={{ background: '#854F0B' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">カロリー目標の設定</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {current && (
          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-xs text-amber-600 mb-1">現在の目標</p>
            <p className="text-2xl font-medium text-amber-800">{current.calorieGoal.toLocaleString()} kcal / 日</p>
            {current.saltGoal && <p className="text-sm text-amber-600">塩分 {current.saltGoal}g 以内</p>}
          </div>
        )}

        {saved && <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm text-center">✅ 目標を設定しました！</div>}
        {error && <div className="bg-red-50 text-red-500 rounded-xl p-3 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">目安から選ぶ</p>
          <div className="space-y-2">
            {presets.map(p => (
              <button key={p.key} onClick={() => { setSelected(p.key); setCustom(''); setSaved(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${selected === p.key ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                <p className="font-medium text-sm">{p.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.calories} kcal・タンパク質 {p.protein}g・塩分 {p.salt}g</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">または自分で入力する（kcal）</p>
          <input type="number" value={custom} onChange={e => { setCustom(e.target.value); setSelected(''); setSaved(false); }}
            placeholder="例：1600" min="800" max="4000"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xl font-medium focus:outline-none focus:border-amber-400" />
        </div>

        <button onClick={save} className="w-full py-4 rounded-2xl font-medium text-base text-white" style={{ background: '#854F0B' }}>
          目標を設定する
        </button>
      </div>
    </div>
  );
}
