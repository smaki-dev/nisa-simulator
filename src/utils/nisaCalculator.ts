// 資産（銘柄）ごとの入力データ構造
export interface AssetInput {
    currentValue: number | '';  // 現在の保有金額（円）
    currentProfit: number | ''; // 現在の評価損益（円）
    monthlyAmount: number;      // 月積立額（円）
    annualReturn: number;       // 想定年率（%）
}

// 全体の入力データ構造
export interface NisaSimulatorInput {
    currentAgeYears: number;   // 現在年齢（歳）
    currentAgeMonths: number;  // 現在年齢（月：0〜11）
    sp500: AssetInput;
    gold: AssetInput;
    nasdaq100: AssetInput;
}

// 年次の計算結果
export interface YearlyResult {
    year: number;              // 経過年
    age: number;               // 年齢
    sp500Evaluation: number;   // S&P500 評価額
    goldEvaluation: number;    // ゴールド 評価額
    nasdaq100Evaluation: number; // NASDAQ100 評価額
    totalEvaluation: number;  // 合計評価額
    totalInvestment: number;  // 累計買付額（元本）
}

// 最終（60歳時点）のサマリー結果
export interface NisaSummary {
    yearsTo60Display: string;           // 例: 24年6か月
    totalMonthsTo60: number;            // 60歳までの総月数
    currentTotalValue: number;          // 現在の保有金額（合計）
    currentTotalProfit: number;         // 現在の評価損益（合計）
    currentTotalInvestment: number;     // 現在の推定買付額（元本合計）
    monthlyTotalAmount: number;         // 毎月の積立合計
    additionalInvestment: number;       // これからの追加積立額
    totalInvestmentAt60: number;        // 60歳時点の累計買付額
    sp500At60: number;                  // 60歳時点のS&P500評価額
    goldAt60: number;                   // 60歳時点のゴールド評価額
    nasdaq100At60: number;              // 60歳時点のNASDAQ100評価額
    totalEvaluationAt60: number;        // 60歳時点の合計評価額
    remainingNisaLimit: number;         // NISA残り枠（現在時点）
    nisaUsageRateAt60: number;          // NISA生涯枠使用率（60歳時点 %）
    nisaLimitReachedAgeText: string;    // NISA枠1800万円到達予想
}

const NISA_MAX_LIMIT = 18000000; // 生涯投資枠：1,800万円

// 空文字を 0 に安全変換するヘルパー関数
const safeVal = (val: number | ''): number => (val === '' || isNaN(val) ? 0 : val);

/**
 * NISAシミュレーション計算メイン関数
 */
export const calculateNisaSimulator = (
    input: NisaSimulatorInput
): { yearlyResults: YearlyResult[]; summary: NisaSummary } => {
    // 60歳（720か月）までの残り月数計算
    const currentTotalMonths = input.currentAgeYears * 12 + input.currentAgeMonths;
    const targetTotalMonths = 60 * 12; // 720か月
    const totalMonthsTo60 = Math.max(0, targetTotalMonths - currentTotalMonths);

    const yearsTo60 = Math.floor(totalMonthsTo60 / 12);
    const remMonthsTo60 = totalMonthsTo60 % 12;
    const yearsTo60Display = `${yearsTo60}年${remMonthsTo60}か月`;

    // 各銘柄の保有金額と評価損益
    const sp500Val = safeVal(input.sp500.currentValue);
    const sp500Profit = safeVal(input.sp500.currentProfit);
    const goldVal = safeVal(input.gold.currentValue);
    const goldProfit = safeVal(input.gold.currentProfit);
    const nasdaq100Val = safeVal(input.nasdaq100.currentValue);
    const nasdaq100Profit = safeVal(input.nasdaq100.currentProfit);

    // 買付額（元本） = 保有金額 - 評価損益
    const sp500Inv = Math.max(0, sp500Val - sp500Profit);
    const goldInv = Math.max(0, goldVal - goldProfit);
    const nasdaq100Inv = Math.max(0, nasdaq100Val - nasdaq100Profit);

    // 現在の合計
    const currentTotalValue = sp500Val + goldVal + nasdaq100Val;
    const currentTotalProfit = sp500Profit + goldProfit + nasdaq100Profit;
    const currentTotalInvestment = sp500Inv + goldInv + nasdaq100Inv;

    const initialMonthlyTotal =
        input.sp500.monthlyAmount +
        input.gold.monthlyAmount +
        input.nasdaq100.monthlyAmount;

    // 月利
    const sp500MonthlyRate = input.sp500.annualReturn / 100 / 12;
    const goldMonthlyRate = input.gold.annualReturn / 100 / 12;
    const nasdaq100MonthlyRate = input.nasdaq100.annualReturn / 100 / 12;

    // 状態追跡用変数
    let currentSp500Eval = sp500Val;
    let currentGoldEval = goldVal;
    let currentNasdaqEval = nasdaq100Val;

    let currentCumulatedInvestment = currentTotalInvestment;
    let additionalInvestmentTotal = 0;

    let reachedMonth: number | null = null;

    const yearlyResults: YearlyResult[] = [];

    // 初期状態（0年目）を保存
    yearlyResults.push({
        year: 0,
        age: input.currentAgeYears,
        sp500Evaluation: Math.round(currentSp500Eval),
        goldEvaluation: Math.round(currentGoldEval),
        nasdaq100Evaluation: Math.round(currentNasdaqEval),
        totalEvaluation: Math.round(currentSp500Eval + currentGoldEval + currentNasdaqEval),
        totalInvestment: Math.round(currentCumulatedInvestment),
    });

    // 月単位で運用・積立計算
    for (let month = 1; month <= totalMonthsTo60; month++) {
        const isLimitReached = currentCumulatedInvestment >= NISA_MAX_LIMIT;

        if (isLimitReached && reachedMonth === null) {
            reachedMonth = month - 1;
        }

        let addSp500 = 0;
        let addGold = 0;
        let addNasdaq = 0;

        if (!isLimitReached) {
            const room = NISA_MAX_LIMIT - currentCumulatedInvestment;
            const plannedMonthlyTotal =
                input.sp500.monthlyAmount +
                input.gold.monthlyAmount +
                input.nasdaq100.monthlyAmount;

            if (plannedMonthlyTotal > 0) {
                if (plannedMonthlyTotal <= room) {
                    addSp500 = input.sp500.monthlyAmount;
                    addGold = input.gold.monthlyAmount;
                    addNasdaq = input.nasdaq100.monthlyAmount;
                } else {
                    const ratio = room / plannedMonthlyTotal;
                    addSp500 = input.sp500.monthlyAmount * ratio;
                    addGold = input.gold.monthlyAmount * ratio;
                    addNasdaq = input.nasdaq100.monthlyAmount * ratio;
                }
            }
        }

        const monthlyAdded = addSp500 + addGold + addNasdaq;
        currentCumulatedInvestment += monthlyAdded;
        additionalInvestmentTotal += monthlyAdded;

        // 複利運用処理
        currentSp500Eval = (currentSp500Eval + addSp500) * (1 + sp500MonthlyRate);
        currentGoldEval = (currentGoldEval + addGold) * (1 + goldMonthlyRate);
        currentNasdaqEval = (currentNasdaqEval + addNasdaq) * (1 + nasdaq100MonthlyRate);

        // 1年（12ヶ月）ごと、または最終月
        if (month % 12 === 0) {
            const year = month / 12;
            yearlyResults.push({
                year,
                age: input.currentAgeYears + year,
                sp500Evaluation: Math.round(currentSp500Eval),
                goldEvaluation: Math.round(currentGoldEval),
                nasdaq100Evaluation: Math.round(currentNasdaqEval),
                totalEvaluation: Math.round(
                    currentSp500Eval + currentGoldEval + currentNasdaqEval
                ),
                totalInvestment: Math.round(currentCumulatedInvestment),
            });
        }
    }

    // NISA枠到達年齢の判定
    let nisaLimitReachedAgeText = '60歳までに未到達';
    if (currentTotalInvestment >= NISA_MAX_LIMIT) {
        nisaLimitReachedAgeText = 'すでに上限（1,800万円）到達済み';
    } else if (reachedMonth !== null) {
        const totalReachedMonths = currentTotalMonths + reachedMonth;
        const reachedYears = Math.floor(totalReachedMonths / 12);
        const reachedMonthsRem = totalReachedMonths % 12;
        nisaLimitReachedAgeText = `約${reachedYears}歳${reachedMonthsRem}か月`;
    } else if (currentCumulatedInvestment >= NISA_MAX_LIMIT) {
        // 【追加】60歳ちょうど（最終月）で1,800万円に達した場合の判定
        nisaLimitReachedAgeText = '60歳0か月';
    }

    const totalEvaluationAt60 = Math.round(
        currentSp500Eval + currentGoldEval + currentNasdaqEval
    );

    const nisaUsageRateAt60 = Math.min(
        100,
        Number(((currentCumulatedInvestment / NISA_MAX_LIMIT) * 100).toFixed(1))
    );

    const summary: NisaSummary = {
        yearsTo60Display,
        totalMonthsTo60,
        currentTotalValue,
        currentTotalProfit,
        currentTotalInvestment,
        monthlyTotalAmount: initialMonthlyTotal,
        additionalInvestment: Math.round(additionalInvestmentTotal),
        totalInvestmentAt60: Math.round(currentCumulatedInvestment),
        sp500At60: Math.round(currentSp500Eval),
        goldAt60: Math.round(currentGoldEval),
        nasdaq100At60: Math.round(currentNasdaqEval),
        totalEvaluationAt60,
        remainingNisaLimit: Math.max(0, NISA_MAX_LIMIT - currentTotalInvestment),
        nisaUsageRateAt60,
        nisaLimitReachedAgeText,
    };

    return { yearlyResults, summary };
};