import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination, {
  usePagination,
} from "../../../components/TablePagination";
import styles from "./productTable.module.css";
import { useAuth } from "../../../context/AuthContext";
import { Permissions } from "../../../helpers/auth";

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
  const rows = useMemo(() => data ?? [], [data]);
  const { pageItems, paginationProps } = usePagination(rows);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManageProducts = can(Permissions.ProductsManage);

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
    <>
      <div className="table-scroll">
        <table className={styles.customTable}>
          <thead>
            <tr>
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
            {pageItems.map((row) => (
              <tr key={row.id}>
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
                      row.isActive ? styles.badge : styles.inactivebadge
                    }
                  >
                    {row?.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {canManageProducts && (
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
                              navigate(`/content-management/edit/${row.id}`, {
                                state: { product: row },
                              });
                            }}
                          >
                            Edit
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination {...paginationProps} />
    </>
  );
};

export default LoanTable;
