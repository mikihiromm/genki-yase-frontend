'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';
const USER_ID = 'user_001';

export default function HealthPage() {
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [weightGoalInput, setWeightGoalInput] = useState('');
  const [savedWeightGoal, setSavedWeightGoal] = useState<number | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [savedWeight, setSavedWeight] = useState(false);
  const [savedBP, setSavedBP] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/health/${USER_ID}/latest`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/goals/${USER_ID}`).then(r => r.json()).catch(() => ({})),
    ]).then(([healthData, goalData]) => {
      if (healthData.success && healthData.weight != null) {
        setLatestWeight(healthData.weight);
        setWeight(String(healthData.weight));
      }
      if (goalData.success && goalData.goals?.weightGoal != null) {
        const wg = parseFloat(goalData.goals.weightGoal);
        setSavedWeightGoal(wg);
        setWeightGoalInput(String(wg));
      }
    }).finally(() => setLoading(false));
  }, []);

  const saveWeight = async () => {
    setError('');
    if (!weight) { setError('体重を入力してください'); return; }
    const res = await fetch(`${API}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        weight: parseFloat(weight),
        systolic: null,
        diastolic: null,
        recordedAt: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      setLatestWeight(parseFloat(weight));
      setSavedWeight(true);
      setTimeout(() => setSavedWeight(false), 2000);
    } else {
      setError('体重の記録に失敗しました');
    }
  };

  const saveWeightGoal = async () => {
    if (!weightGoalInput || parseFloat(weightGoalInput) < 30) {
      setError('目標体重を正しく入力してください');
      return;
    }
    const goalsRes = await fetch(`${API}/api/goals/${USER_ID}`).then(r => r.json()).catch(() => ({}));
    const calorieGoal = goalsRes?.goals?.calorieGoal || 1600;
    const proteinGoal = goalsRes?.goals?.proteinGoal;
    const saltGoal = goalsRes?.goals?.saltGoal;

    const res = await fetch(`${API}/api/goals/${USER_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calorieGoal,
        proteinGoal,
        saltGoal,
        weightGoal: parseFloat(weightGoalInput),
      }),
    });
    if (res.ok) {
      setSavedWeightGoal(parseFloat(weightGoalInput));
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2000);
    } else {
      setError('目標の保存に失敗しました');
    }
  };

  const saveBP = async () => {
    setError('');
    if (!systolic) { setError('血圧（上）を入力してください'); return; }
    const res = await fetch(`${API}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        weight: null,
        systolic: parseInt(systolic),
        diastolic: diastolic ? parseInt(diastolic) : null,
        recordedAt: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      setSavedBP(true);
      setSystolic('');
      setDiastolic('');
      setTimeout(() => setSavedBP(false), 2000);
    } else {
      setError('血圧の記録に失敗しました');
    }
  };

  const diff = latestWeight != null && savedWeightGoal != null
    ? Math.round((latestWeight - savedWeightGoal) * 10) / 10
    : null;

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <div style={{ background: '#993556' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
          <Link href="/" className="text-white text-2xl">←</Link>
          <h1 className="text-xl font-medium">体重・血圧の記録</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div style={{ background: '#993556' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">体重・血圧の記録</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {error && <div className="bg-red-50 text-red-500 rounded-xl p-3 text-sm">{error}</div>}

        {/* 体重セクション */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">⚖️ 体重の記録と目標</p>

          {/* 進捗表示 */}
          {(latestWeight != null || savedWeightGoal != null) && (
            <div className="bg-rose-50 rounded-xl p-3 mb-4 flex gap-3 text-center">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">現在</p>
                <p className="text-xl font-medium text-gray-700">
                  {latestWeight != null ? `${latestWeight}kg` : '---'}
                </p>
              </div>
              <div className="text-gray-300 flex items-center text-2xl">→</div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">目標</p>
                <p className="text-xl font-medium" style={{ color: '#993556' }}>
                  {savedWeightGoal != null ? `${savedWeightGoal}kg` : '未設定'}
                </p>
              </div>
              {diff != null && (
                <>
                  <div className="text-gray-300 flex items-center text-2xl">→</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">あと</p>
                    <p className={`text-lg font-medium ${diff <= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                      {diff <= 0 ? '達成！🎉' : `${diff}kg`}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 現在の体重入力 */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">今日の体重（kg）</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="例：68.5"
                step="0.1" min="30" max="200"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-2xl font-medium focus:outline-none focus:border-[#993556]"
              />
              <button
                onClick={saveWeight}
                className="px-4 py-3 rounded-xl text-white text-sm font-medium shrink-0"
                style={{ background: savedWeight ? '#22c55e' : '#993556' }}
              >
                {savedWeight ? '✓ 保存' : '記録'}
              </button>
            </div>
          </div>

          {/* 目標体重入力 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">目標体重（kg）</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weightGoalInput}
                onChange={e => setWeightGoalInput(e.target.value)}
                placeholder="例：65.0"
                step="0.1" min="30" max="200"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-2xl font-medium focus:outline-none focus:border-[#993556]"
              />
              <button
                onClick={saveWeightGoal}
                className="px-4 py-3 rounded-xl text-white text-sm font-medium shrink-0"
                style={{ background: goalSaved ? '#22c55e' : '#993556' }}
              >
                {goalSaved ? '✓ 保存' : '目標設定'}
              </button>
            </div>
          </div>
        </div>

        {/* 血圧セクション */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">❤️ 血圧の記録</p>
          <div className="flex gap-3 items-center mb-3">
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
          <button
            onClick={saveBP}
            className={`w-full py-3 rounded-xl text-white font-medium text-sm ${savedBP ? 'bg-green-500' : 'bg-[#185FA5]'}`}
          >
            {savedBP ? '✓ 血圧を記録しました！' : '血圧を記録する'}
          </button>
        </div>

        <Link href="/" className="block text-center text-[#185FA5] text-sm py-2">ホームに戻る</Link>
      </div>
    </div>
  );
}
