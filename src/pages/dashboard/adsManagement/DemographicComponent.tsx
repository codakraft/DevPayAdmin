import styles from "./DemographicComponent.module.css";
import { AdFormValues } from "./formik-types/formikTypes";
import { useState, useMemo } from "react";

interface AdvertDetailsProps {
  values: AdFormValues;
  setFieldValue: <K extends keyof AdFormValues>(
    field: K,
    value: AdFormValues[K],
    shouldValidate?: boolean
  ) => void;
}

const Fees = [
  {
    id: "1",
    name: "Legal Fees",
    amount: "2%",
  },
  {
    id: "2",
    name: "Management Fees",
    amount: "1%",
  },
  {
    id: "3",
    name: "Processing Fees",
    amount: "0.5%",
  },
];

export default function DemographicComponent({
  values,
  setFieldValue,
}: AdvertDetailsProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInterestSelect = (interest: string) => {
    if (values.interest.includes(interest)) return;
    setFieldValue("interest", [...values.interest, interest]);
    setShowDropdown(false);
  };

  const removeInterest = (interest: string) => {
    setFieldValue(
      "interest",
      values.interest.filter((item) => item !== interest)
    );
  };

  const selectedFees = useMemo(
    () => values.interestFeesTable || [],
    [values.interestFeesTable]
  );

  const isAllSelected = useMemo(
    () => selectedFees.length === Fees.length && Fees.length > 0,
    [selectedFees.length]
  );

  const toggleAll = () => {
    if (isAllSelected) {
      setFieldValue("interestFeesTable", []);
    } else {
      setFieldValue("interestFeesTable", Fees);
    }
  };

  const toggleOne = (fee: { id: string; name: string; amount: string }) => {
    const feeIndex = selectedFees.findIndex((f) => f.id === fee.id);
    let newFees;
    if (feeIndex > -1) {
      newFees = selectedFees.filter((f) => f.id !== fee.id);
    } else {
      newFees = [...selectedFees, fee];
    }
    setFieldValue("interestFeesTable", newFees);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.section}>
        <p className={styles.labelUnderline}>Fees</p>
        <div className={styles.radioGroup}>
          {/* {GenderOptions.map((option) => (
            <label
              key={option}
              className={`${styles.radioLabel} ${
                values.gender === option ? styles.radioLabelSelected : ""
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={option}
                checked={values.gender === option}
                onChange={() => setFieldValue("gender", option)}
              />
              {option}
            </label>
          ))} */}
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th>Name</th>
                <th>Amount</th>
                {/* <th>Processing Fee</th> */}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Fees.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedFees.some((f) => f.id === row.id)}
                      onChange={() => toggleOne(row)}
                    />
                  </td>
                  <td>{row.name}</td>
                  <td>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={styles.section}
        style={{
          marginTop: 32,
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
                  checked={values.interestComputationFrequency === "Per Month"}
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
                  checked={values.interestComputationFrequency === "Per Annum"}
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
              <option value="Flat">Flat</option>
              <option value="Reducing">Reducing</option>
              <option value="Reducing Interest But Increasing Principal">
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
