'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

export default function HealthPage() {
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [weightGoal, setWeightGoal] = useState('');
  const [savedWeightGoal, setSavedWeightGoal] = useState<number | null>(null);
  const [goalSaved, setGoalSaved] = useState(false);

  useEffect(() => {
    // 最新の体重を取得
    fetch(`${API}/api/health/${USER_ID}/latest`)
      .then(r => r.json())
      .then(d => { if (d.success && d.weight) setLatestWeight(d.weight); })
      .catch(() => {});

    // 体重目標を取得
    fetch(`${API}/api/goals/${USER_ID}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.goals.weightGoal) {
          setSavedWeightGoal(parseFloat(d.goals.weightGoal));
          setWeightGoal(String(d.goals.weightGoal));
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setError('');
    if (!weight && !systolic) { setError('体重か血圧のどちらかを入力してください'); return; }
    const res = await fetch(`${API}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        weight: weight ? parseFloat(weight) : null,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
        recordedAt: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      setSaved(true);
      if (weight) setLatestWeight(parseFloat(weight));
    } else {
      setError('記録に失敗しました。もう一度お試しください。');
    }
  };

  const saveWeightGoal = async () => {
    if (!weightGoal || parseFloat(weightGoal) < 30) { return; }
    const res = await fetch(`${API}/api/goals/${USER_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calorieGoal: 1600, weightGoal: parseFloat(weightGoal) }),
    });
    if (res.ok) {
      setSavedWeightGoal(parseFloat(weightGoal));
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2000);
    }
  };

  const diff = latestWeight && savedWeightGoal ? (latestWeight - savedWeightGoal) : null;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div style={{ background: '#993556' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">体重・血圧の記録</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* 体重目標カード */}
        {(latestWeight || savedWeightGoal) && (
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100">
            <p className="text-sm font-medium text-rose-600 mb-3">🎯 体重目標の進捗</p>
            <div className="flex gap-4 text-center">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">現在</p>
                <p className="text-2xl font-medium text-gray-800">
                  {latestWeight != null ? `${latestWeight}kg` : '---'}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">目標</p>
                <p className="text-2xl font-medium" style={{ color: '#993556' }}>
                  {savedWeightGoal != null ? `${savedWeightGoal}kg` : '未設定'}
                </p>
              </div>
              {diff != null && (
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">あと</p>
                  <p className={`text-2xl font-medium ${diff <= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {diff <= 0 ? '達成！🎉' : `${diff.toFixed(1)}kg`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 体重目標設定 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm text-gray-500 mb-2">🎯 体重の目標（kg）</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weightGoal}
              onChange={e => setWeightGoal(e.target.value)}
              placeholder="例：65.0"
              step="0.1" min="30" max="200"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-xl font-medium focus:outline-none focus:border-[#993556]"
            />
            <button
              onClick={saveWeightGoal}
              className="px-4 py-3 rounded-xl text-white text-sm font-medium"
              style={{ background: goalSaved ? '#22c55e' : '#993556' }}
            >
              {goalSaved ? '✓ 保存' : '設定'}
            </button>
          </div>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-4">
            <p className="text-6xl">✅</p>
            <p className="text-xl font-medium">記録しました！</p>
            <button onClick={() => { setSaved(false); setWeight(''); setSystolic(''); setDiastolic(''); }}
              className="mt-2 border border-gray-200 text-gray-500 px-6 py-2 rounded-xl text-sm">続けて記録する</button>
            <Link href="/" className="text-[#185FA5] text-sm">ホームに戻る</Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 text-red-500 rounded-xl p-3 text-sm">{error}</div>}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-sm text-gray-500 mb-2">⚖️ 体重（kg）</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="例：68.5" step="0.1" min="30" max="200"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-medium focus:outline-none focus:border-[#185FA5]" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-sm text-gray-500 mb-3">❤️ 血圧（mmHg）</label>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">上（収縮期）</p>
                  <input type="number" value={systolic} onChange={e => setSystolic(e.target.value)}
                    placeholder="例：120" min="60" max="250"
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-xl font-medium text-center focus:outline-none focus:border-[#185FA5]" />
                </div>
                <span className="text-gray-300 text-2xl mt-4">/</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">下（拡張期）</p>
                  <input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)}
                    placeholder="例：80" min="40" max="150"
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-xl font-medium text-center focus:outline-none focus:border-[#185FA5]" />
                </div>
              </div>
            </div>
            <button onClick={save} className="w-full bg-[#185FA5] text-white py-4 rounded-2xl font-medium text-base">記録する</button>
          </>
        )}
      </div>
    </div>
  );
}
