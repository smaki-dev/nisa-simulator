import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Calculator, ShieldCheck, PieChart, Table as TableIcon, RotateCcw } from 'lucide-react';
import { calculateNisaSimulator } from './utils/nisaCalculator';
import type { NisaSimulatorInput } from './utils/nisaCalculator';

// 初期値の定義
const INITIAL_INPUT: NisaSimulatorInput = {
  currentAgeYears: 35,
  currentAgeMonths: 0,
  targetAgeYears: 60,
  sp500: {
    currentValue: '',
    currentProfit: '',
    monthlyAmount: 0,
    annualReturn: 5,
  },
  gold: {
    currentValue: '',
    currentProfit: '',
    monthlyAmount: 0,
    annualReturn: 3,
  },
  nasdaq100: {
    currentValue: '',
    currentProfit: '',
    monthlyAmount: 0,
    annualReturn: 7,
  },
};

export function App() {
  const [input, setInput] = useState<NisaSimulatorInput>(INITIAL_INPUT);

  // カンマ区切りフォーマット用ヘルパー
  const formatNumberWithCommas = (val: number | '') => {
    if (val === '' || isNaN(Number(val))) return '';
    return Number(val).toLocaleString();
  };

  const handleInputChange = (
    section: 'top' | 'sp500' | 'gold' | 'nasdaq100',
    field: string,
    value: string
  ) => {
    // カンマを除去して数値化
    const rawValue = value.replace(/,/g, '');
    const parsedValue = rawValue === '' ? '' : Number(rawValue);

    if (isNaN(parsedValue as number)) return;

    if (section === 'top') {
      setInput((prev) => ({ ...prev, [field]: parsedValue }));
    } else {
      setInput((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: parsedValue,
        },
      }));
    }
  };

  // リセット処理
  const handleReset = () => {
    if (window.confirm('入力内容を初期状態に戻しますか？')) {
      setInput(INITIAL_INPUT);
    }
  };

  const monthlyOptions: number[] = [];
  for (let i = 0; i <= 200000; i += 5000) {
    monthlyOptions.push(i);
  }

  const { yearlyResults, summary } = calculateNisaSimulator(input);

  const assets = [
    { key: 'sp500', name: 'S&P500', returnOptions: [3, 5, 7] },
    { key: 'gold', name: 'ゴールド', returnOptions: [2, 3, 4] },
    { key: 'nasdaq100', name: 'NASDAQ100', returnOptions: [4, 7, 9] },
  ] as const;

  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '12px', fontFamily: 'sans-serif', color: '#333', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <style>{`
        *, *:before, *:after {
          box-sizing: border-box !important;
        }

        input, select {
          font-size: 16px !important;
        }

        .desktop-only-table { display: table !important; }
        .mobile-only-cards { display: none !important; }

        @media (max-width: 600px) {
          .desktop-only-table { display: none !important; }
          .mobile-only-cards { display: flex !important; }
        }
      `}</style>

      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', borderBottom: '2px solid #2196f3', paddingBottom: '8px', marginTop: '4px' }}>
        <Calculator color="#2196f3" /> NISA資産形成シミュレーター
      </h1>

      {/* ■ 前提条件 */}
      <section style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e0e0e0', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '6px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>
            前提条件
          </h2>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            <RotateCcw size={14} /> リセット
          </button>
        </div>

        {/* 現在年齢・目標年齢 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>現在：</label>
            <select
              value={input.currentAgeYears}
              onChange={(e) => handleInputChange('top', 'currentAgeYears', e.target.value)}
              style={{ padding: '6px' }}
            >
              {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                <option key={age} value={age}>
                  {age}歳
                </option>
              ))}
            </select>
            <select
              value={input.currentAgeMonths}
              onChange={(e) => handleInputChange('top', 'currentAgeMonths', e.target.value)}
              style={{ padding: '6px' }}
            >
              {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>
                  {m}か月
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>目標：</label>
            <select
              value={input.targetAgeYears ?? 60}
              onChange={(e) => handleInputChange('top', 'targetAgeYears', e.target.value)}
              style={{ padding: '6px' }}
            >
              {Array.from({ length: 31 }, (_, i) => i + 45).map((age) => (
                <option key={age} value={age} disabled={age <= input.currentAgeYears}>
                  {age}歳
                </option>
              ))}
            </select>
          </div>

          <div style={{ padding: '6px 10px', background: '#e3f2fd', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', width: '100%', textAlign: 'center' }}>
            {summary.targetAge}歳まで： {summary.yearsToTargetDisplay} （{summary.totalMonthsToTarget}か月）
          </div>
        </div>

        {/* PC用テーブル */}
        <table className="desktop-only-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', marginBottom: '16px', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ccc', width: '15%' }}>銘柄</th>
              <th style={{ padding: '8px', border: '1px solid #ccc', width: '25%' }}>現在の保有金額 (円)</th>
              <th style={{ padding: '8px', border: '1px solid #ccc', width: '25%' }}>現在の評価損益 (円)</th>
              <th style={{ padding: '8px', border: '1px solid #ccc', width: '20%' }}>月積立額 (円)</th>
              <th style={{ padding: '8px', border: '1px solid #ccc', width: '15%' }}>想定年率 (%)</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.key}>
                <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>{asset.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 1,000,000"
                    value={formatNumberWithCommas(input[asset.key].currentValue)}
                    onChange={(e) => handleInputChange(asset.key, 'currentValue', e.target.value)}
                    style={{ width: '100%', padding: '6px' }}
                  />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 200,000"
                    value={formatNumberWithCommas(input[asset.key].currentProfit)}
                    onChange={(e) => handleInputChange(asset.key, 'currentProfit', e.target.value)}
                    style={{ width: '100%', padding: '6px' }}
                  />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <select
                    value={input[asset.key].monthlyAmount}
                    onChange={(e) => handleInputChange(asset.key, 'monthlyAmount', e.target.value)}
                    style={{ width: '100%', padding: '6px' }}
                  >
                    {monthlyOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.toLocaleString()}円
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <select
                    value={input[asset.key].annualReturn}
                    onChange={(e) => handleInputChange(asset.key, 'annualReturn', e.target.value)}
                    style={{ width: '100%', padding: '6px' }}
                  >
                    {asset.returnOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* スマホ用カード */}
        <div className="mobile-only-cards" style={{ flexDirection: 'column', gap: '10px', marginBottom: '16px', width: '100%' }}>
          {assets.map((asset) => {
            const data = input[asset.key];
            return (
              <div key={asset.key} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', width: '100%' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px', color: '#1976d2', fontSize: '14px' }}>
                  {asset.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'calc(50% - 4px) calc(50% - 4px)', gap: '8px', width: '100%' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>保有金額(円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="例: 1,000,000"
                      value={formatNumberWithCommas(data.currentValue)}
                      onChange={(e) => handleInputChange(asset.key, 'currentValue', e.target.value)}
                      style={{ width: '100%', padding: '6px 4px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>評価損益(円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="例: 200,000"
                      value={formatNumberWithCommas(data.currentProfit)}
                      onChange={(e) => handleInputChange(asset.key, 'currentProfit', e.target.value)}
                      style={{ width: '100%', padding: '6px 4px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>月積立額(円)</label>
                    <select
                      value={data.monthlyAmount}
                      onChange={(e) => handleInputChange(asset.key, 'monthlyAmount', e.target.value)}
                      style={{ width: '100%', padding: '6px 2px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      {monthlyOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.toLocaleString()}円
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>想定年率(%)</label>
                    <select
                      value={data.annualReturn}
                      onChange={(e) => handleInputChange(asset.key, 'annualReturn', e.target.value)}
                      style={{ width: '100%', padding: '6px 4px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      {asset.returnOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '11px' }}>
            毎月の積立合計： <br /><strong style={{ fontSize: '13px' }}>{(summary.monthlyTotalAmount / 10000).toLocaleString()} 万円</strong>
          </div>
          <div style={{ padding: '8px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '11px' }}>
            枠使用率（{summary.targetAge}歳時点）： <br /><strong style={{ fontSize: '13px' }}>{summary.nisaUsageRateAtTarget}%</strong>
          </div>
        </div>
      </section>

      {/* ■ NISA生涯投資枠 */}
      <section style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #c8e6c9', width: '100%' }}>
        <h2 style={{ fontSize: '15px', marginTop: 0, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={18} /> NISA生涯投資枠（1,800万円）
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>現在の買付額（元本）</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{summary.currentTotalInvestment.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>NISA残り枠（現在）</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2e7d32' }}>{summary.remainingNisaLimit.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>1,800万到達予想</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d84315' }}>{summary.nisaLimitReachedAgeText}</div>
          </div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>{summary.targetAge}歳累計買付額</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{summary.totalInvestmentAtTarget.toLocaleString()} 円</div>
          </div>
        </div>
      </section>

      {/* ■ 運用結果 */}
      <section style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ffe0b2', width: '100%' }}>
        <h2 style={{ fontSize: '15px', marginTop: 0, color: '#e65100', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={18} /> {summary.targetAge}歳時点の資産成果
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>これからの追加積立額</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{summary.additionalInvestment.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>{summary.targetAge}歳累計買付額</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{summary.totalInvestmentAtTarget.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>{summary.targetAge}歳時点の合計評価額</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1565c0' }}>
              {summary.totalEvaluationAtTarget.toLocaleString()} 円
            </div>
            <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold' }}>
              運用益: +{(summary.totalEvaluationAtTarget - summary.totalInvestmentAtTarget).toLocaleString()} 円
            </div>
          </div>
        </div>

        {/* 銘柄内訳 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <div style={{ background: '#fff', padding: '6px 2px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>S&P500</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8884d8' }}>{summary.sp500AtTarget.toLocaleString()}円</div>
          </div>
          <div style={{ background: '#fff', padding: '6px 2px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>ゴールド</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e6a100' }}>{summary.goldAtTarget.toLocaleString()}円</div>
          </div>
          <div style={{ background: '#fff', padding: '6px 2px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>NASDAQ100</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#82ca9d' }}>{summary.nasdaq100AtTarget.toLocaleString()}円</div>
          </div>
        </div>
      </section>

      {/* ■ 資産推移グラフ */}
      <section style={{ marginBottom: '24px', width: '100%' }}>
        <h2 style={{ fontSize: '16px' }}>資産推移グラフ</h2>
        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyResults} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" unit="歳" fontSize={11} />
              <YAxis tickFormatter={(val) => `${Math.round(val / 10000)}万`} fontSize={10} width={50} />
              <Tooltip
                formatter={(value) => [value != null ? `${Number(value).toLocaleString()} 円` : '0 円']}
                labelFormatter={(label) => `${label}歳`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="sp500Evaluation" name="S&P500" stackId="a" fill="#8884d8" />
              <Bar dataKey="goldEvaluation" name="ゴールド" stackId="a" fill="#ffc658" />
              <Bar dataKey="nasdaq100Evaluation" name="NASDAQ100" stackId="a" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ■ 年別資産推移 */}
      <section style={{ width: '100%' }}>
        <h2 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TableIcon size={18} /> 年別資産推移
        </h2>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#37474f', color: '#fff' }}>
                <th style={{ padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>経過</th>
                <th style={{ padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>年齢</th>
                <th style={{ padding: '6px', whiteSpace: 'nowrap' }}>S&P500 (円)</th>
                <th style={{ padding: '6px', whiteSpace: 'nowrap' }}>ゴールド (円)</th>
                <th style={{ padding: '6px', whiteSpace: 'nowrap' }}>NASDAQ100 (円)</th>
                <th style={{ padding: '6px', whiteSpace: 'nowrap' }}>合計評価額 (円)</th>
                <th style={{ padding: '6px', whiteSpace: 'nowrap' }}>累計買付額 (円)</th>
              </tr>
            </thead>
            <tbody>
              {yearlyResults.map((row) => (
                <tr key={row.year} style={{ borderBottom: '1px solid #eee', background: row.year % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{row.year}年</td>
                  <td style={{ padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{row.age}歳</td>
                  <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{row.sp500Evaluation.toLocaleString()}</td>
                  <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{row.goldEvaluation.toLocaleString()}</td>
                  <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{row.nasdaq100Evaluation.toLocaleString()}</td>
                  <td style={{ padding: '6px', fontWeight: 'bold', color: '#1565c0', whiteSpace: 'nowrap' }}>{row.totalEvaluation.toLocaleString()}</td>
                  <td style={{ padding: '6px', color: '#555', whiteSpace: 'nowrap' }}>{row.totalInvestment.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;