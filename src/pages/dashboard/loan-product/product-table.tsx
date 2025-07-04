import React, { useState } from "react";
import styles from "./productTable.module.css";

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
    organization: "Devtage Financial Payroll Lending",
    interestRate: "4.0%",
    loanRange: "100,000 - 1,000,000",
    loanTenor: "12 months",
    status: "Inactive",
  },
];

export default function LoanTable() {
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const isAllSelected = selected.length === dummyData.length;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : dummyData.map((row) => row.id));
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
        {dummyData.map((row) => (
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
                  <p>{row.organization}</p>
                </div>
              </div>
            </td>
            <td>{row.id}</td>
            <td>{row.interestRate}</td>
            <td>{row.loanRange}</td>
            <td>{row.loanTenor}</td>
            <td>
              <span
                className={
                  row.status === "Active" ? styles.badge : styles.inactivebadge
                }
              >
                {row.status}
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
}
