export interface AdFormValues {
  mediaType: string;
  title: string;
  link: string;
  cta: string;
  upload: File | null;
  carousel: File[];
  banner: File | null;
  video: File | null;
  gender: string;
  interest: string[];
  ageRange: string[];
  days: string;
  budget: string;

  // Loan product fields
  name?: string;
  code?: string;
  minLoanAmount?: string;
  maxLoanAmount?: string;
  minTenor?: string;
  maxTenor?: string;
  minAge?: string;
  maxAge?: string;
  moratorium?: string;
  notifyApprovers?: boolean;

  // Loan product settings fields
  interestRate?: string;
  penaltyPercent?: string;
  turnoverEligibility?: string;
  interestComputationFrequency?: string;
  interestComputationBasis?: string;
  paymentScheduleBreakdown?: string;
  allowMultipleLoans?: boolean;

  // Interest Fees Table
  interestFeesTable?: Array<{ [key: string]: string | number | null }>;
}
