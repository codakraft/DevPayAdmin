import { AdFormValues } from "./formik-types/formikTypes";
import styles from "./AdvertDetails.module.css";

interface PreviewComponentProps {
  values: AdFormValues;
}

export default function PreviewComponent({ values }: PreviewComponentProps) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Loan Product Preview
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          background: "#faf9fd",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: 32,
          marginBottom: 32,
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
        <PreviewField label="Minimum Tenor (Months)" value={values.minTenor} />
        <PreviewField label="Maximum Tenor (Months)" value={values.maxTenor} />
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
          value={values.interestComputationFrequency}
        />
        <PreviewField
          label="Interest Computation Basis"
          value={values.interestComputationBasis}
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
      <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
        Demographics & Targeting
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: 32,
        }}
      >
        <PreviewField label="Gender" value={values.gender} />
        <PreviewField label="Age Range" value={values.ageRange?.join(", ")} />
        <PreviewField label="Interest" value={values.interest?.join(", ")} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 600, margin: "32px 0 16px 0" }}>
        Interest Fees Table
      </h3>
      {Array.isArray(values.interestFeesTable) &&
      values.interestFeesTable.length > 0 ? (
        <table
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            marginBottom: 32,
          }}
        >
          <thead>
            <tr
              style={{ background: "#f4f4f7", color: "#666", fontWeight: 600 }}
            >
              {Object.keys(
                values.interestFeesTable[0] as Record<string, any>
              ).map((col: string) => (
                <th
                  key={col}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {col
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(
              values.interestFeesTable as Array<
                Record<string, string | number | null>
              >
            ).map(
              (row: Record<string, string | number | null>, idx: number) => (
                <tr key={idx}>
                  {Object.values(row).map((cell, i) => (
                    <td
                      key={i}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid #f4f4f7",
                        color: "#222",
                      }}
                    >
                      {cell !== undefined && cell !== null && cell !== ""
                        ? cell
                        : "—"}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <div style={{ color: "#bbb", marginBottom: 32 }}>
          No interest fees table data.
        </div>
      )}
    </div>
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
