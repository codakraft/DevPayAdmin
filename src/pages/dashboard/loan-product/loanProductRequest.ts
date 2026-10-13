import { CreateLoanData } from "../../../types/types";

export interface LoanProductFormValues {
  name: string;
  code: string;
  minLoanAmount: string;
  maxLoanAmount: string;
  minTenor: string;
  maxTenor: string;
  moratorium: string;
  notifyApprovers: boolean;
  interestRate: string;
  penaltyPercent: string;
  turnoverEligibility: string;
  interestComputationFrequency: string;
  interestComputationBasis: string;
}

const toNumber = (value: string) => Number(value || 0);

// Returns the first problem with the form, or null when it can be submitted
export const validateLoanProduct = (
  values: LoanProductFormValues,
): string | null => {
  if (!values.name.trim()) return "Name is required.";
  if (!values.code.trim()) return "Code is required.";
  if (!values.minLoanAmount || !values.maxLoanAmount) {
    return "Minimum and maximum loan amounts are required.";
  }
  if (toNumber(values.minLoanAmount) > toNumber(values.maxLoanAmount)) {
    return "Minimum loan amount cannot be more than the maximum.";
  }
  if (!values.minTenor || !values.maxTenor) {
    return "Minimum and maximum tenor are required.";
  }
  if (toNumber(values.minTenor) > toNumber(values.maxTenor)) {
    return "Minimum tenor cannot be more than the maximum.";
  }
  if (!values.interestRate || isNaN(Number(values.interestRate))) {
    return "Enter a valid interest rate.";
  }
  if (!values.interestComputationFrequency) {
    return "Select an interest computation frequency.";
  }
  if (!values.interestComputationBasis) {
    return "Select an interest computation basis.";
  }
  return null;
};

export const buildLoanProductBody = (
  values: LoanProductFormValues,
): CreateLoanData => ({
  name: values.name.trim(),
  shortName: values.code.trim(),
  code: values.code.trim(),
  description: values.name.trim(),
  interestRate: toNumber(values.interestRate),
  minAmount: toNumber(values.minLoanAmount),
  maxAmount: toNumber(values.maxLoanAmount),
  minTenor: toNumber(values.minTenor),
  maxTenor: toNumber(values.maxTenor),
  moratorium: toNumber(values.moratorium),
  penaltyOnDefaultPrincipal: toNumber(values.penaltyPercent),
  notifyApprovalsViaEmail: values.notifyApprovers,
  turnoverEligibilityPercent: toNumber(values.turnoverEligibility),
  interestComputationBasis: toNumber(values.interestComputationBasis),
  interestCostComputation: toNumber(values.interestComputationFrequency),
  paymentScheduleBreakdown: 0,
  paymentScheduleType: 0,
});
