export interface AssetInput {
  currentValue: number | '';
  currentProfit: number | '';
  monthlyAmount: number;
  annualReturn: number;
}

export interface NisaSimulatorInput {
  currentAgeYears: number;
  currentAgeMonths: number;
  targetAgeYears?: number;
  sp500: AssetInput;
  gold: AssetInput;
  nasdaq100: AssetInput;
}

export interface YearlyResult {
  year: number;
  age: number;
  sp500Evaluation: number;
  goldEvaluation: number;
  nasdaq100Evaluation: number;
  totalEvaluation: number;
  totalInvestment: number;
}

export function calculateNisaSimulator(input: NisaSimulatorInput) {
  const targetAge = input.targetAgeYears ?? 60;
  const currentTotalMonths = input.currentAgeYears * 12 + input.currentAgeMonths;
  const targetTotalMonths = targetAge * 12;
  const totalMonthsToTarget = Math.max(0, targetTotalMonths - currentTotalMonths);

  const yearsToTargetDisplay = `${Math.floor(totalMonthsToTarget / 12)}年${totalMonthsToTarget % 12}か月`;

  const sp500Val = Number(input.sp500.currentValue) || 0;
  const sp500Prof = Number(input.sp500.currentProfit) || 0;
  const goldVal = Number(input.gold.currentValue) || 0;
  const goldProf = Number(input.gold.currentProfit) || 0;
  const nasdaqVal = Number(input.nasdaq100.currentValue) || 0;
  const nasdaqProf = Number(input.nasdaq100.currentProfit) || 0;

  const currentTotalValue = sp500Val + goldVal + nasdaqVal;
  const currentTotalProfit = sp500Prof + goldProf + nasdaqProf;
  const currentTotalInvestment = Math.max(0, currentTotalValue - currentTotalProfit);

  const monthlyTotalAmount =
    input.sp500.monthlyAmount + input.gold.monthlyAmount + input.nasdaq100.monthlyAmount;

  const NISA_LIMIT = 18000000;
  const remainingNisaLimit = Math.max(0, NISA_LIMIT - currentTotalInvestment);

  let monthsToReachLimit = -1;
  if (monthlyTotalAmount > 0) {
    monthsToReachLimit = Math.ceil(remainingNisaLimit / monthlyTotalAmount);
  }

  let nisaLimitReachedAgeText = '未到達';
  if (remainingNisaLimit === 0) {
    nisaLimitReachedAgeText = '到達済み';
  } else if (monthsToReachLimit > 0) {
    const totalMonthsAtLimit = currentTotalMonths + monthsToReachLimit;
    const ageAtLimit = Math.floor(totalMonthsAtLimit / 12);
    const monthsAtLimit = totalMonthsAtLimit % 12;
    nisaLimitReachedAgeText = `${ageAtLimit}歳${monthsAtLimit}か月`;
  }

  const additionalInvestmentNoLimit = monthlyTotalAmount * totalMonthsToTarget;
  const additionalInvestment = Math.min(additionalInvestmentNoLimit, remainingNisaLimit);
  const totalInvestmentAtTarget = currentTotalInvestment + additionalInvestment;
  const nisaUsageRateAtTarget = Math.min(
    100,
    Math.round((totalInvestmentAtTarget / NISA_LIMIT) * 100)
  );

  const yearsCount = Math.max(1, targetAge - input.currentAgeYears);
  const yearlyResults: YearlyResult[] = [];

  let sp500Eval = sp500Val;
  let goldEval = goldVal;
  let nasdaqEval = nasdaqVal;
  let currentAccumulatedInv = currentTotalInvestment;

  for (let year = 1; year <= yearsCount; year++) {
    const displayAge = input.currentAgeYears + year;

    for (let m = 1; m <= 12; m++) {
      if (currentAccumulatedInv < NISA_LIMIT) {
        const canInvest = NISA_LIMIT - currentAccumulatedInv;
        const actualSp500 = Math.min(input.sp500.monthlyAmount, canInvest);
        sp500Eval = (sp500Eval + actualSp500) * (1 + input.sp500.annualReturn / 100 / 12);
        currentAccumulatedInv += actualSp500;

        const canInvestGold = NISA_LIMIT - currentAccumulatedInv;
        const actualGold = Math.min(input.gold.monthlyAmount, canInvestGold);
        goldEval = (goldEval + actualGold) * (1 + input.gold.annualReturn / 100 / 12);
        currentAccumulatedInv += actualGold;

        const canInvestNasdaq = NISA_LIMIT - currentAccumulatedInv;
        const actualNasdaq = Math.min(input.nasdaq100.monthlyAmount, canInvestNasdaq);
        nasdaqEval = (nasdaqEval + actualNasdaq) * (1 + input.nasdaq100.annualReturn / 100 / 12);
        currentAccumulatedInv += actualNasdaq;
      } else {
        sp500Eval *= 1 + input.sp500.annualReturn / 100 / 12;
        goldEval *= 1 + input.gold.annualReturn / 100 / 12;
        nasdaqEval *= 1 + input.nasdaq100.annualReturn / 100 / 12;
      }
    }

    const roundedSp500 = Math.round(sp500Eval);
    const roundedGold = Math.round(goldEval);
    const roundedNasdaq = Math.round(nasdaqEval);
    const totalEval = roundedSp500 + roundedGold + roundedNasdaq;

    yearlyResults.push({
      year,
      age: displayAge,
      sp500Evaluation: roundedSp500,
      goldEvaluation: roundedGold,
      nasdaq100Evaluation: roundedNasdaq,
      totalEvaluation: totalEval,
      totalInvestment: Math.round(currentAccumulatedInv),
    });
  }

  const lastResult = yearlyResults[yearlyResults.length - 1] || {
    sp500Evaluation: sp500Val,
    goldEvaluation: goldVal,
    nasdaq100Evaluation: nasdaqVal,
    totalEvaluation: currentTotalValue,
    totalInvestment: currentTotalInvestment,
  };

  return {
    yearlyResults,
    summary: {
      targetAge,
      yearsToTargetDisplay,
      totalMonthsToTarget,
      monthlyTotalAmount,
      currentTotalInvestment,
      remainingNisaLimit,
      nisaLimitReachedAgeText,
      additionalInvestment,
      totalInvestmentAtTarget,
      nisaUsageRateAtTarget,
      totalEvaluationAtTarget: lastResult.totalEvaluation,
      sp500AtTarget: lastResult.sp500Evaluation,
      goldAtTarget: lastResult.goldEvaluation,
      nasdaq100AtTarget: lastResult.nasdaq100Evaluation,
    },
  };
}