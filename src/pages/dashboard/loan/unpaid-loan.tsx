import UnpaidTable from "../components/UnpaidTable";
import styles from "../adsManagement/createAdd.module.css";
import { useLazyGetLoansQuery } from "../../../store/apiSlice";
import { useEffect, useState } from "react";

export default function UnpaidLoan() {
  const [getLoans, { isLoading: isLoadingCompanyLoans }] =
    useLazyGetLoansQuery();

  const [data, setData] = useState<any[]>([]);

  const fetchLoans = async () => {
    try {
      const response = await getLoans({ status: 6 }).unwrap();
     
      if (response?.data) {
        setData(response.data.loans);
      }
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
          <h1>Unpaid Loan Report</h1>
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
        <UnpaidTable data={data} />
      ) : null}
    </>
  );
}
