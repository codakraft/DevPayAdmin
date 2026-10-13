import styles from "./DemographicComponent.module.css";
import { AdFormValues } from "./formik-types/formikTypes";

interface AdvertDetailsProps {
  values: AdFormValues;
  setFieldValue: <K extends keyof AdFormValues>(
    field: K,
    value: AdFormValues[K],
    shouldValidate?: boolean
  ) => void;
}

export default function DemographicComponent({
  values,
  setFieldValue,
}: AdvertDetailsProps) {
  return (
    <div className={styles.formContainer}>
      <div
        className={styles.section}
        style={{
          background: "#faf9fd",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <p className={styles.labelUnderline}>Loan Product Settings</p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <div>
            <label className={styles.label}>Interest Rate (%)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. 4.0"
              value={values.interestRate || ""}
              onChange={(e) => setFieldValue("interestRate", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className={styles.label}>
              Penalty % on Defaulting Principal
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. 2.5"
              value={values.penaltyPercent || ""}
              onChange={(e) => setFieldValue("penaltyPercent", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className={styles.label}>Turnover Eligibility %</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. 50"
              value={values.turnoverEligibility || ""}
              onChange={(e) =>
                setFieldValue("turnoverEligibility", e.target.value)
              }
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className={styles.label}>
              Interest Computation Frequency
            </label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="interestComputationFrequency"
                  value="Per Month"
                  checked={values.interestComputationFrequency === "0"}
                  onChange={() =>
                    setFieldValue("interestComputationFrequency", "0")
                  }
                />
                Per Month
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="interestComputationFrequency"
                  value="Per Annum"
                  checked={values.interestComputationFrequency === "1"}
                  onChange={() =>
                    setFieldValue("interestComputationFrequency", "1")
                  }
                />
                Per Annum
              </label>
            </div>
          </div>
          <div>
            <label className={styles.label}>Interest Computation Basis</label>
            <select
              className={styles.input}
              value={values.interestComputationBasis || ""}
              onChange={(e) =>
                setFieldValue("interestComputationBasis", e.target.value)
              }
              style={{ width: "100%" }}
            >
              <option value="">Select Basis</option>
              <option value="0">Flat</option>
              <option value="1">Reducing</option>
              <option value="2">
                Reducing Interest But Increasing Principal
              </option>
            </select>
          </div>
          <div>
            <label className={styles.label}>Payment Schedule Breakdown</label>
            <select
              className={styles.input}
              value={values.paymentScheduleBreakdown || ""}
              onChange={(e) =>
                setFieldValue("paymentScheduleBreakdown", e.target.value)
              }
              style={{ width: "100%" }}
            >
              <option value="">Select Breakdown</option>
              <option value="In Months">In Months</option>
              <option value="In Days">In Days</option>
            </select>
          </div>
          <div>
            <label className={styles.label}>
              Allow Multiple Running Loans?
            </label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="allowMultipleLoans"
                  value="yes"
                  checked={values.allowMultipleLoans === true}
                  onChange={() => setFieldValue("allowMultipleLoans", true)}
                />
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="allowMultipleLoans"
                  value="no"
                  checked={values.allowMultipleLoans === false}
                  onChange={() => setFieldValue("allowMultipleLoans", false)}
                />
                No
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
