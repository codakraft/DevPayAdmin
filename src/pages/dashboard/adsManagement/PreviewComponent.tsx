import React, { useState } from "react";
import { AdFormValues } from "./formik-types/formikTypes";
import SuccessModal from "../../../ui/components/modal/SuccessModal";

const FREQUENCY_LABELS: Record<string, string> = {
  "0": "Per Month",
  "1": "Per Annum",
};

const BASIS_LABELS: Record<string, string> = {
  "0": "Flat",
  "1": "Reducing",
  "2": "Reducing Interest But Increasing Principal",
};

interface PreviewComponentProps {
  values: AdFormValues;
  onSuccess?: () => void;
}

export default function PreviewComponent({
  values,
  onSuccess,
}: PreviewComponentProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCreateLoanProduct = () => {
    // Simulate API call or actual creation logic
    console.log("Creating loan product with values:", values);

    // Save to localStorage for loan products
    const existingProducts = JSON.parse(
      localStorage.getItem("createdLoanProducts") || "[]"
    );
    const newProduct = {
      id: String(Date.now()).slice(-4), // Generate a simple ID from timestamp
      organization: values.name || "Unnamed Product",
      interestRate: values.interestRate ? `${values.interestRate}%` : "0%",
      loanRange: `${values.minLoanAmount || 0} - ${values.maxLoanAmount || 0}`,
      loanTenor: values.maxTenor ? `${values.maxTenor} months` : "0 months",
      status: "Active",
      createdAt: new Date().toISOString(),
      formData: values, // Store all form values for future reference
    };

    const updatedProducts = [...existingProducts, newProduct];
    localStorage.setItem(
      "createdLoanProducts",
      JSON.stringify(updatedProducts)
    );

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("loanProductCreated"));

    // Show success modal
    setShowSuccessModal(true);

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Optionally navigate back to loan products list or dashboard
  };

  return (
    <>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Loan Product Preview
          </h2>
          {/* <button
            onClick={handleCreateLoanProduct}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#4f46e5")}
          >
            Create Loan Product
          </button> */}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            background: "#faf9fd",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            padding: 32,
          }}
        >
          <PreviewField label="Name" value={values.name} />
          <PreviewField label="Code" value={values.code} />
          <PreviewField
            label="Minimum Loan Amount"
            value={values.minLoanAmount}
          />
          <PreviewField
            label="Maximum Loan Amount"
            value={values.maxLoanAmount}
          />
          <PreviewField
            label="Minimum Tenor (Months)"
            value={values.minTenor}
          />
          <PreviewField
            label="Maximum Tenor (Months)"
            value={values.maxTenor}
          />
          <PreviewField label="Min Age For Applicants" value={values.minAge} />
          <PreviewField label="Max Age For Applicants" value={values.maxAge} />
          <PreviewField label="Moratorium (Days)" value={values.moratorium} />
          <PreviewField
            label="Notify Approvers Via Email?"
            value={values.notifyApprovers ? "Yes" : "No"}
          />
          <PreviewField label="Interest Rate (%)" value={values.interestRate} />
          <PreviewField
            label="Penalty % on Defaulting Principal"
            value={values.penaltyPercent}
          />
          <PreviewField
            label="Turnover Eligibility %"
            value={values.turnoverEligibility}
          />
          <PreviewField
            label="Interest Computation Frequency"
            value={FREQUENCY_LABELS[values.interestComputationFrequency ?? ""]}
          />
          <PreviewField
            label="Interest Computation Basis"
            value={BASIS_LABELS[values.interestComputationBasis ?? ""]}
          />
          <PreviewField
            label="Payment Schedule Breakdown"
            value={values.paymentScheduleBreakdown}
          />
          <PreviewField
            label="Allow Multiple Running Loans?"
            value={values.allowMultipleLoans ? "Yes" : "No"}
          />
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title="Loan Product Created Successfully!"
        message={`Your loan product "${
          values.name || "Untitled"
        }" has been created successfully and is now available for use.`}
      />
    </>
  );
}

function PreviewField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontWeight: 500,
          color: "#666",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 17,
          color: "#222",
          fontWeight: 600,
          background: "#f4f4f7",
          borderRadius: 6,
          padding: "8px 14px",
        }}
      >
        {value || <span style={{ color: "#bbb" }}>—</span>}
      </div>
    </div>
  );
}
