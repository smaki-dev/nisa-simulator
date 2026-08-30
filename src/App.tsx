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
import { Calculator, ShieldCheck, PieChart, Table as TableIcon } from 'lucide-react';
import { calculateNisaSimulator } from './utils/nisaCalculator';
import type { NisaSimulatorInput } from './utils/nisaCalculator';

export function App() {
  // 初期入力状態設定（年齢は35歳0か月、数値入力項目はブランク）
  const [input, setInput] = useState<NisaSimulatorInput>({
    currentAgeYears: 35,
    currentAgeMonths: 0,
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
  });

  // 入力変更ハンドラー（数値・空文字対応）
  const handleInputChange = (
    section: 'top' | 'sp500' | 'gold' | 'nasdaq100',
    field: string,
    value: string
  ) => {
    const parsedValue = value === '' ? '' : Number(value);

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

  // プルダウンの選択肢を作成（0〜20万円まで5千円単位）
  const monthlyOptions: number[] = [];
  for (let i = 0; i <= 200000; i += 5000) {
    monthlyOptions.push(i);
  }

  // シミュレーション実行
  const { yearlyResults, summary } = calculateNisaSimulator(input);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', borderBottom: '2px solid #2196f3', paddingBottom: '8px' }}>
        <Calculator color="#2196f3" /> NISA資産形成シミュレーター
      </h1>

      {/* ■ 前提条件（入力フォーム） */}
      <section style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '6px' }}>
          前提条件
        </h2>

        {/* 基本情報（年齢・月数） */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>現在年齢：</label>
            <select
              value={input.currentAgeYears}
              onChange={(e) => handleInputChange('top', 'currentAgeYears', e.target.value)}
              style={{ padding: '6px 12px', fontSize: '16px', marginLeft: '8px' }}
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
              style={{ padding: '6px 12px', fontSize: '16px', marginLeft: '8px' }}
            >
              {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>
                  {m}か月
                </option>
              ))}
            </select>
          </div>

          <div style={{ padding: '6px 12px', background: '#e3f2fd', borderRadius: '4px', fontWeight: 'bold' }}>
            60歳まで： {summary.yearsTo60Display} （{summary.totalMonthsTo60}か月）
          </div>
        </div>

        {/* 3銘柄の個別入力テーブル */}
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', marginBottom: '16px', tableLayout: 'fixed' }}>
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
            {/* S&P500 */}
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>S&P500</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <input
                  type="number"
                  placeholder="例: 1000000"
                  value={input.sp500.currentValue}
                  onChange={(e) => handleInputChange('sp500', 'currentValue', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <input
                  type="number"
                  placeholder="例: 200000 (+/-可)"
                  value={input.sp500.currentProfit}
                  onChange={(e) => handleInputChange('sp500', 'currentProfit', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <select
                  value={input.sp500.monthlyAmount}
                  onChange={(e) => handleInputChange('sp500', 'monthlyAmount', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
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
                  value={input.sp500.annualReturn}
                  onChange={(e) => handleInputChange('sp500', 'annualReturn', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                >
                  <option value={3}>3%</option>
                  <option value={5}>5%</option>
                  <option value={7}>7%</option>
                </select>
              </td>
            </tr>

            {/* ゴールド */}
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>ゴールド</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <input
                  type="number"
                  placeholder="例: 300000"
                  value={input.gold.currentValue}
                  onChange={(e) => handleInputChange('gold', 'currentValue', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <input
                  type="number"
                  placeholder="例: 50000 (+/-可)"
                  value={input.gold.currentProfit}
                  onChange={(e) => handleInputChange('gold', 'currentProfit', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <select
                  value={input.gold.monthlyAmount}
                  onChange={(e) => handleInputChange('gold', 'monthlyAmount', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
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
                  value={input.gold.annualReturn}
                  onChange={(e) => handleInputChange('gold', 'annualReturn', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                >
                  <option value={2}>2%</option>
                  <option value={3}>3%</option>
                  <option value={4}>4%</option>
                </select>
              </td>
            </tr>

            {/* NASDAQ100 */}
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>NASDAQ100</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <input
                  type="number"
                  placeholder="例: 500000"
                  value={input.nasdaq100.currentValue}
                  onChange={(e) => handleInputChange('nasdaq100', 'currentValue', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <input
                  type="number"
                  placeholder="例: 100000 (+/-可)"
                  value={input.nasdaq100.currentProfit}
                  onChange={(e) => handleInputChange('nasdaq100', 'currentProfit', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                <select
                  value={input.nasdaq100.monthlyAmount}
                  onChange={(e) => handleInputChange('nasdaq100', 'monthlyAmount', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
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
                  value={input.nasdaq100.annualReturn}
                  onChange={(e) => handleInputChange('nasdaq100', 'annualReturn', e.target.value)}
                  style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                >
                  <option value={4}>4%</option>
                  <option value={7}>7%</option>
                  <option value={9}>9%</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 前提条件サマリー算出値 */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
            毎月の積立合計： <strong>{(summary.monthlyTotalAmount / 10000).toLocaleString()} 万円</strong> （{summary.monthlyTotalAmount.toLocaleString()} 円）
          </div>
          <div style={{ padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
            NISA生涯投資枠使用率（60歳時点）： <strong>{summary.nisaUsageRateAt60}%</strong>
          </div>
        </div>
      </section>

      {/* ■ NISA生涯投資枠1,800万円の使用状況 */}
      <section style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #c8e6c9' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck /> NISA生涯投資枠（1,800万円）の使用状況
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>現在の推定買付額（元本合計）</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{summary.currentTotalInvestment.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>NISA残り枠（現在時点）</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>{summary.remainingNisaLimit.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>1,800万円枠の到達予想</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d84315' }}>{summary.nisaLimitReachedAgeText}</div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #a5d6a7' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>60歳時点の累計買付額</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{summary.totalInvestmentAt60.toLocaleString()} 円</div>
          </div>
        </div>
      </section>

      {/* ■ 60歳までの積立・運用結果（標準シナリオ） */}
      <section style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ffe0b2' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0, color: '#e65100', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart /> 60歳までの積立・運用結果（標準シナリオ）
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>これからの追加積立額</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{summary.additionalInvestment.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>60歳までの累計買付額（現在分含む）</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{summary.totalInvestmentAt60.toLocaleString()} 円</div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>60歳時点の合計評価額</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>
              {summary.totalEvaluationAt60.toLocaleString()} 円
              <span style={{ fontSize: '14px', color: '#2e7d32', marginLeft: '12px' }}>
                (運用益: +{(summary.totalEvaluationAt60 - summary.totalInvestmentAt60).toLocaleString()} 円)
              </span>
            </div>
          </div>
        </div>

        {/* 銘柄内訳 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>60歳時点 S&P500</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8884d8' }}>{summary.sp500At60.toLocaleString()} 円</div>
          </div>
          <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>60歳時点 ゴールド</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffc658' }}>{summary.goldAt60.toLocaleString()} 円</div>
          </div>
          <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>60歳時点 NASDAQ100</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#82ca9d' }}>{summary.nasdaq100At60.toLocaleString()} 円</div>
          </div>
        </div>
      </section>

      {/* ■ 資産推移グラフ（積み上げ棒グラフ） */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px' }}>資産推移グラフ</h2>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" unit="歳" />
              <YAxis tickFormatter={(val) => `${Math.round(val / 10000)}万`} />
              <Tooltip
                formatter={(value) => [value != null ? `${Number(value).toLocaleString()} 円` : '0 円']}
                labelFormatter={(label) => `${label}歳`}
              />
              <Legend />
              <Bar dataKey="sp500Evaluation" name="S&P500" stackId="a" fill="#8884d8" />
              <Bar dataKey="goldEvaluation" name="ゴールド" stackId="a" fill="#ffc658" />
              <Bar dataKey="nasdaq100Evaluation" name="NASDAQ100" stackId="a" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ■ 一覧テーブル */}
      <section>
        <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TableIcon /> 年次一覧テーブル
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#37474f', color: '#fff' }}>
                <th style={{ padding: '8px', textAlign: 'center' }}>経過年</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>年齢</th>
                <th style={{ padding: '8px' }}>S&P500 (円)</th>
                <th style={{ padding: '8px' }}>ゴールド (円)</th>
                <th style={{ padding: '8px' }}>NASDAQ100 (円)</th>
                <th style={{ padding: '8px' }}>合計評価額 (円)</th>
                <th style={{ padding: '8px' }}>累計買付額 (円)</th>
              </tr>
            </thead>
            <tbody>
              {yearlyResults.map((row) => (
                <tr key={row.year} style={{ borderBottom: '1px solid #eee', background: row.year % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{row.year}年目</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{row.age}歳</td>
                  <td style={{ padding: '8px' }}>{row.sp500Evaluation.toLocaleString()}</td>
                  <td style={{ padding: '8px' }}>{row.goldEvaluation.toLocaleString()}</td>
                  <td style={{ padding: '8px' }}>{row.nasdaq100Evaluation.toLocaleString()}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#1565c0' }}>{row.totalEvaluation.toLocaleString()}</td>
                  <td style={{ padding: '8px', color: '#555' }}>{row.totalInvestment.toLocaleString()}</td>
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