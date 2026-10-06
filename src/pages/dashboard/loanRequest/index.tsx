import { ReactComponent as CheckIcon } from "../../../assets/create-add.svg";
import { Link } from "react-router-dom";
import AdsTable from "../components/AdsTable";
import Button from "../../../ui/components/button/button";
import styles from "./styles.module.css";
import LoanRequestTable from "./components/loanTable";
import {
  useLazyGetCompayLoansQuery,
  useLazyGetLoanProductQuery,
  useLazyGetLoansQuery,
} from "../../../store/apiSlice";
import { useEffect, useState } from "react";
import { fetchAllPages, toPageResult } from "../../../helpers/pagination";

export default function LoanRequestPage() {
  const [getLoans, { isLoading: isLoadingCompanyLoans }] =
    useLazyGetLoansQuery();

  const [data, setData] = useState<any[]>([]);

  const fetchLoans = async () => {
    try {
      const loans = await fetchAllPages(async (page, pageSize) =>
        toPageResult<any>(
          await getLoans({ status: 0, page, pageSize }).unwrap(),
          "loans"
        )
      );
      setData(loans);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    }
  };
  useEffect(() => {
    fetchLoans();
  }, []);
  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>Loan Request</h1>
          <p>Here is a view of your pending loan requests</p>
        </div>
      </div>

      {isLoadingCompanyLoans ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <div
            className="spinner"
            style={{
              width: 40,
              height: 40,
              border: "4px solid #eee",
              borderTop: "4px solid #3A7145",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`@keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }`}
          </style>
        </div>
      ) : data ? (
        <LoanRequestTable data={data} />
      ) : null}
    </>
  );
}
