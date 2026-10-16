import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination, {
  usePagination,
} from "../../../components/TablePagination";
import styles from "./productTable.module.css";
import { useAuth } from "../../../context/AuthContext";
import { Permissions, getErrorMessage } from "../../../helpers/auth";
import {
  useActivateLoanProductMutation,
  useDeactivateLoanProductMutation,
} from "../../../store/apiSlice";

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
  // Called with the product the backend returns after a status change
  onProductChange?: (product: LoanDataProp) => void;
}
// const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
// export default function LoanTable() {
const LoanTable: React.FC<LoanData> = ({ data, onProductChange }) => {
  const rows = useMemo(() => data ?? [], [data]);
  const { pageItems, paginationProps } = usePagination(rows);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManageProducts = can(Permissions.ProductsManage);

  const [activateLoanProduct] = useActivateLoanProductMutation();
  const [deactivateLoanProduct] = useDeactivateLoanProductMutation();

  const handleToggleActive = async (row: LoanDataProp) => {
    setMenuOpenId(null);
    const active = !row.isActive;
    // isActive is only a label for now: the backend still accepts applications for inactive products
    if (
      !active &&
      !window.confirm(`Deactivate ${row.name}? It will be marked as inactive.`)
    ) {
      return;
    }
    setBusyId(row.id);
    try {
      const res = active
        ? await activateLoanProduct({ id: row.id }).unwrap()
        : await deactivateLoanProduct({ id: row.id }).unwrap();
      onProductChange?.({ ...row, ...res?.data, isActive: res?.data?.isActive ?? active });
    } catch (error) {
      alert(
        getErrorMessage(
          error,
          `Failed to ${active ? "activate" : "deactivate"} loan product`
        )
      );
    } finally {
      setBusyId(null);
    }
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
                        disabled={busyId === row.id}
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
                              color: row.isActive ? "#d32f2f" : "#3A7145",
                            }}
                            onClick={() => handleToggleActive(row)}
                          >
                            {row.isActive ? "Deactivate" : "Activate"}
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
