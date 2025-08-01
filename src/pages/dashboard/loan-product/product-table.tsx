import React, { useState, useEffect } from "react";
import styles from "./productTable.module.css";
import { useLazyGetLoanProductQuery } from "../../../store/apiSlice";

const dummyData = [
  {
    id: "0021",
    organization: "Devtage Financial Payroll Lending",
    interestRate: "4.0%",
    loanRange: "100,000 - 1,000,000",
    loanTenor: "12 months",
    status: "Active",
  },
  {
    id: "0014",
    organization: "Fairpay Financial Service",
    interestRate: "4.0%",
    loanRange: "100,000 - 1,000,000",
    loanTenor: "12 months",
    status: "Inactive",
  },
];

interface LoanDataProp {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  shortName: string;
  description: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenor: number;
  maxTenor: number;
  moratorium: number;
  isActive: boolean;
  interestComputationBasis: number;
  interestCostComputation: number;
  notifyApprovalsViaEmail: boolean;
  paymentScheduleBreakdown: number;
  paymentScheduleType: number;
  penaltyOnDefaultPrincipal: number;
  turnoverEligibilityPercent: number;
}

interface LoanData {
  data: LoanDataProp[];
}
// const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
// export default function LoanTable() {
const LoanTable: React.FC<LoanData> = ({ data }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [tableData, setTableData] = useState(dummyData);

  console.log("dataloan", data);

  // Load created loan products from localStorage
  useEffect(() => {
    const loadCreatedProducts = () => {
      const createdProducts = JSON.parse(
        localStorage.getItem("createdLoanProducts") || "[]"
      );
      // Combine dummy data with created products
      const combinedData = [...dummyData, ...createdProducts];
      setTableData(combinedData);
    };

    loadCreatedProducts();

    // Listen for storage changes to update table when new products are created
    const handleStorageChange = () => {
      loadCreatedProducts();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event when localStorage is updated within the same tab
    window.addEventListener("loanProductCreated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loanProductCreated", handleStorageChange);
    };
  }, []);

  const isAllSelected = selected.length === tableData.length;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : tableData.map((row) => row.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Close menu on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".ellipsis-menu")) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpenId]);

  return (
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
          <th>Product</th>
          <th>ID</th>
          <th>Interest Rate</th>
          <th>Loan Amount Range</th>
          <th>Loan Tenor</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={() => toggleOne(row.id)}
              />
            </td>
            <td>
              <div className={styles.adDetails}>
                {/* <img src={row.image} alt={row.title} /> */}
                <div>
                  {/* <strong>{row.dateCreated}</strong> */}
                  <p>{row.name}</p>
                </div>
              </div>
            </td>
            <td>{row.shortName}</td>
            <td>{row.interestRate}%</td>
            <td>
              {row.minAmount} - {row.maxAmount}
            </td>
            <td>
              {row.minTenor} - {row.maxTenor}
            </td>
            <td>
              <span
                className={
                  row.companyId === "Active"
                    ? styles.badge
                    : styles.inactivebadge
                }
              >
                {row?.isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td>
              <div style={{ position: "relative" }}>
                <button
                  className={styles.ellipsisBtn}
                  aria-label="More options"
                  onClick={() =>
                    setMenuOpenId(menuOpenId === row.id ? null : row.id)
                  }
                  type="button"
                >
                  ...
                </button>
                {menuOpenId === row.id && (
                  <div
                    className="ellipsis-menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      borderRadius: 6,
                      zIndex: 10,
                      minWidth: 120,
                      padding: 0,
                    }}
                  >
                    <button
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onClick={() => {
                        setMenuOpenId(null);
                        // handle view logic here
                        alert(`View ${row.id}`);
                      }}
                    >
                      View
                    </button>
                    <button
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#d32f2f",
                      }}
                      onClick={() => {
                        setMenuOpenId(null);
                        // handle disable logic here
                        alert(`Disable ${row.id}`);
                      }}
                    >
                      Disable
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LoanTable;
