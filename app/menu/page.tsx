'use client';
import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://backend-two-bice-77.vercel.app';

type Dish = { name: string; recipe: string };
type DayPlan = {
  day: number;
  breakfast: { dishes: string[]; recipe: string };
  lunch: { dish: string; recipe: string };
  dinner: {
    patternA: { main: Dish; sides: Dish[] };
    patternB: { main: Dish; sides: Dish[] };
  };
};
type MenuPlan = { usedIngredientsSummary: string; days: DayPlan[] };

const COURSES: { id: string; label: string; icon: string; desc: string }[] = [
  { id: 'time_saving', label: '時短重視', icon: '⏱️', desc: '簡単すぐできる' },
  { id: 'nutrition_balance', label: '栄養バランス重視', icon: '🥦', desc: 'シニア向け栄養' },
  { id: 'diet', label: 'ダイエット重視', icon: '🍃', desc: '低カロリー高タンパク' },
  { id: 'use_up_ingredients', label: '材料使い切り重視', icon: '♻️', desc: '無駄なく使い切る' },
];

export default function MenuPage() {
  const [step, setStep] = useState<'photo' | 'analyzing' | 'confirm' | 'generating' | 'result'>('photo');
  const [preview, setPreview] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [seasonings, setSeasonings] = useState<string[]>([]);
  const [leftoverInput, setLeftoverInput] = useState('');
  const [leftovers, setLeftovers] = useState<string[]>([]);
  const [course, setCourse] = useState('nutrition_balance');
  const [plan, setPlan] = useState<MenuPlan | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [error, setError] = useState('');

  const analyzePhoto = async (file: File) => {
    setStep('analyzing');
    setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append('photo', file);
    try {
      const res = await fetch(`${API}/api/menu/analyze-photo`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIngredients(data.data.ingredients || []);
      setSeasonings(data.data.assumedSeasonings || []);
      setStep('confirm');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '分析に失敗しました');
      setStep('photo');
    }
  };

  const toggleIngredient = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const addLeftover = () => {
    const v = leftoverInput.trim();
    if (v && !leftovers.includes(v)) setLeftovers([...leftovers, v]);
    setLeftoverInput('');
  };

  const generate = async () => {
    setStep('generating');
    setError('');
    try {
      const res = await fetch(`${API}/api/menu/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, seasonings, leftovers, course }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data.data);
      setOpenDay(1);
      setStep('result');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '献立の生成に失敗しました');
      setStep('confirm');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div style={{ background: '#185FA5' }} className="px-5 pt-10 pb-5 text-white flex items-center gap-3">
        <Link href="/" className="text-white text-2xl">←</Link>
        <h1 className="text-xl font-medium">1週間の献立を作る</h1>
      </div>

      <div className="flex-1 px-4 py-4">
        {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm mb-4">{error}</div>}

        {step === 'photo' && (
          <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">🛒</p>
            <p className="font-medium text-[#185FA5] text-lg mb-1">買い物した食材の写真を選ぶ</p>
            <p className="text-sm text-gray-400 mb-4">レシートの裏に並べると認識しやすいです</p>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => e.target.files?.[0] && analyzePhoto(e.target.files[0])} />
              <span className="inline-block bg-[#185FA5] text-white px-6 py-3 rounded-xl text-sm font-medium">カメラで撮る</span>
            </label>
            <label className="cursor-pointer block mt-2">
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && analyzePhoto(e.target.files[0])} />
              <span className="inline-block border border-[#185FA5] text-[#185FA5] px-6 py-3 rounded-xl text-sm font-medium">アルバムから選ぶ</span>
            </label>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="space-y-4">
            {preview && <img src={preview} alt="買い物写真" className="w-full rounded-2xl object-cover h-48" />}
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-4xl mb-3 animate-bounce">🤖</p>
              <p className="font-medium text-lg mb-1">AIが食材を確認しています</p>
              <p className="text-sm text-gray-400">約3〜5秒かかります</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">認識した食材（タップで除外）</p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(i => (
                  <button key={i} onClick={() => toggleIngredient(ingredients, setIngredients, i)}
                    className="px-3 py-1.5 rounded-full text-sm border border-[#185FA5] text-[#185FA5] bg-blue-50">
                    {i} ✕
                  </button>
                ))}
                {ingredients.length === 0 && <p className="text-sm text-gray-400">食材がありません</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">家にある調味料（タップで除外）</p>
              <div className="flex flex-wrap gap-2">
                {seasonings.map(s => (
                  <button key={s} onClick={() => toggleIngredient(seasonings, setSeasonings, s)}
                    className="px-3 py-1.5 rounded-full text-sm border border-gray-300 text-gray-600">
                    {s} ✕
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">冷蔵庫の残り物（任意で追加）</p>
              <div className="flex gap-2 mb-2">
                <input value={leftoverInput} onChange={e => setLeftoverInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLeftover()}
                  placeholder="例：豆腐、にんじん"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                <button onClick={addLeftover} className="bg-[#185FA5] text-white px-4 rounded-xl text-sm">追加</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {leftovers.map(l => (
                  <button key={l} onClick={() => setLeftovers(leftovers.filter(x => x !== l))}
                    className="px-3 py-1.5 rounded-full text-sm border border-gray-300 text-gray-600">
                    {l} ✕
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">コースを選ぶ</p>
              <div className="grid grid-cols-2 gap-2">
                {COURSES.map(c => (
                  <button key={c.id} onClick={() => setCourse(c.id)}
                    className={`p-3 rounded-xl border text-left ${course === c.id ? 'border-[#185FA5] bg-blue-50' : 'border-gray-200'}`}>
                    <p className="text-2xl">{c.icon}</p>
                    <p className="text-sm font-medium mt-1">{c.label}</p>
                    <p className="text-xs text-gray-400">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={ingredients.length === 0}
              className="w-full bg-[#185FA5] text-white py-4 rounded-2xl font-medium text-base disabled:opacity-40">
              この内容で1週間の献立を作る
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-4xl mb-3 animate-bounce">🧑‍🍳</p>
            <p className="font-medium text-lg mb-1">AIが献立を考えています</p>
            <p className="text-sm text-gray-400">話題のレシピも参考にしています</p>
            <p className="text-xs text-gray-300 mt-2">約20〜40秒かかります</p>
          </div>
        )}

        {step === 'result' && plan && (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-[#185FA5]">💡 {plan.usedIngredientsSummary}</div>

            {plan.days.map(d => (
              <div key={d.day} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button onClick={() => setOpenDay(openDay === d.day ? null : d.day)}
                  className="w-full flex items-center justify-between p-4">
                  <span className="font-medium">{d.day}日目</span>
                  <span className="text-gray-400">{openDay === d.day ? '▲' : '▼'}</span>
                </button>
                {openDay === d.day && (
                  <div className="px-4 pb-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">朝食</p>
                      <p className="font-medium">{d.breakfast.dishes.join('・')}</p>
                      <p className="text-gray-500 mt-1">{d.breakfast.recipe}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">昼食</p>
                      <p className="font-medium">{d.lunch.dish}</p>
                      <p className="text-gray-500 mt-1">{d.lunch.recipe}</p>
                    </div>
                    {(['patternA', 'patternB'] as const).map((p, idx) => (
                      <div key={p} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">夕食 パターン{idx === 0 ? 'A' : 'B'}</p>
                        <p className="font-medium">主菜：{d.dinner[p].main.name}</p>
                        <p className="text-gray-500 mb-2">{d.dinner[p].main.recipe}</p>
                        {d.dinner[p].sides.map((s, i) => (
                          <div key={i} className="mt-1">
                            <p className="font-medium">副菜{i + 1}：{s.name}</p>
                            <p className="text-gray-500">{s.recipe}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => { setStep('photo'); setPlan(null); setIngredients([]); setSeasonings([]); setLeftovers([]); setPreview(''); }}
              className="w-full border border-gray-200 text-gray-500 py-3 rounded-2xl text-sm">最初からやり直す</button>
          </div>
        )}
      </div>
    </div>
  );
}
