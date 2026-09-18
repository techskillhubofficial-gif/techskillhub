export const TECHSKILLHUB_STANDARD_FEE = 49_999;

export const TECHSKILLHUB_REGISTRATION_FEE = 5_000;

export const TECHSKILLHUB_FIRST_LECTURE_FEE = 10_000;

export const TECHSKILLHUB_PROGRAMS = [
  {
    slug: "codeforge",
    title: "CodeForge™",
    price: TECHSKILLHUB_STANDARD_FEE,
  },
  {
    slug: "designsphere",
    title: "DesignSphere™",
    price: TECHSKILLHUB_STANDARD_FEE,
  },
  {
    slug: "growthx",
    title: "GrowthX™",
    price: TECHSKILLHUB_STANDARD_FEE,
  },
  {
    slug: "insightiq",
    title: "InsightIQ™",
    price: TECHSKILLHUB_STANDARD_FEE,
  },
] as const;

export interface FeeCalculationInput {
  baseFee?: number;
  concessionPercent?: number;
  registrationFee?: number;
  firstLectureFee?: number;
}

export interface FeeCalculation {
  baseFee: number;
  concessionPercent: number;
  concessionAmount: number;
  totalFee: number;
  registrationFee: number;
  firstLectureFee: number;
  remainingAfterRegistration: number;
  remainingAfterFirstLecture: number;
}

function normalizeMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
}

export function calculateFee(
  input: FeeCalculationInput = {},
): FeeCalculation {
  const baseFee = normalizeMoney(
    input.baseFee ?? TECHSKILLHUB_STANDARD_FEE,
  );

  const concessionPercent = Math.min(
    100,
    Math.max(
      0,
      Number.isFinite(input.concessionPercent ?? 0)
        ? Math.round(input.concessionPercent ?? 0)
        : 0,
    ),
  );

  const rawConcessionAmount =
    (baseFee * concessionPercent) / 100;

  const concessionAmount = Math.round(
    rawConcessionAmount,
  );

  const totalFee = Math.max(
    0,
    baseFee - concessionAmount,
  );

  const registrationFee = Math.min(
    normalizeMoney(
      input.registrationFee ??
        TECHSKILLHUB_REGISTRATION_FEE,
    ),
    totalFee,
  );

  const firstLectureFee = Math.min(
    normalizeMoney(
      input.firstLectureFee ??
        TECHSKILLHUB_FIRST_LECTURE_FEE,
    ),
    Math.max(totalFee - registrationFee, 0),
  );

  return {
    baseFee,
    concessionPercent,
    concessionAmount,
    totalFee,
    registrationFee,
    firstLectureFee,
    remainingAfterRegistration: Math.max(
      totalFee - registrationFee,
      0,
    ),
    remainingAfterFirstLecture: Math.max(
      totalFee -
        registrationFee -
        firstLectureFee,
      0,
    ),
  };
}

export function buildDefaultInstallmentPlan(
  totalFee: number,
  registrationFee: number,
  firstLectureFee: number,
  startDate = new Date(),
) {
  const safeTotalFee = normalizeMoney(totalFee);

  let remaining = safeTotalFee;

  const installments: Array<{
    installmentNo: number;
    title: string;
    amount: number;
    dueDate: Date;
  }> = [];

  const registrationAmount = Math.min(
    normalizeMoney(registrationFee),
    remaining,
  );

  if (registrationAmount > 0) {
    installments.push({
      installmentNo: 1,
      title: "Registration Fee",
      amount: registrationAmount,
      dueDate: new Date(startDate),
    });

    remaining -= registrationAmount;
  }

  const firstLectureAmount = Math.min(
    normalizeMoney(firstLectureFee),
    remaining,
  );

  if (firstLectureAmount > 0) {
    const firstLectureDate = new Date(startDate);

    /*
     * The actual batch/lecture date can be edited by admin.
     * Seven days is only the safe default when no lecture
     * date has been supplied yet.
     */
    firstLectureDate.setDate(
      firstLectureDate.getDate() + 7,
    );

    installments.push({
      installmentNo: installments.length + 1,
      title: "First Lecture Payment",
      amount: firstLectureAmount,
      dueDate: firstLectureDate,
    });

    remaining -= firstLectureAmount;
  }

  /*
   * Remaining amount:
   *
   * Default = ₹10,000 per installment.
   *
   * Final installment automatically receives the
   * remaining balance, so concessions and unusual
   * totals never create a rounding problem.
   */
  let installmentNumber =
    installments.length + 1;

  let monthsFromStart = 1;

  while (remaining > 0) {
    const amount = Math.min(
      10_000,
      remaining,
    );

    const dueDate = new Date(startDate);

    dueDate.setMonth(
      dueDate.getMonth() + monthsFromStart,
    );

    installments.push({
      installmentNo: installmentNumber,
      title:
        remaining <= 10_000
          ? "Final Payment"
          : `Installment ${installmentNumber - 1}`,
      amount,
      dueDate,
    });

    remaining -= amount;

    installmentNumber += 1;
    monthsFromStart += 1;
  }

  return installments;
}

export function getNextDueInstallment<
  T extends {
    amount: number;
    dueDate: Date;
    status: string;
  },
>(installments: T[]) {
  const pending = installments
    .filter(
      (installment) =>
        installment.status !== "PAID" &&
        installment.status !== "CANCELLED",
    )
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime(),
    );

  return pending[0] ?? null;
}