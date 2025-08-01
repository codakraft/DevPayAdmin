import { ReactComponent as CheckIcon } from "../../../assets/create-add.svg";
import { Link } from "react-router-dom";
import AdsTable from "../components/AdsTable";
import Button from "../../../ui/components/button/button";
import styles from "../adsManagement/createAdd.module.css";
import AllLoanTable from "../components/AllLoansTable";
import React, { useEffect, useState } from "react";
import { useLazyGetLoansQuery } from "../../../store/apiSlice";

export default function AllLoan() {
  const [getLoans, { isLoading: isLoadingCompanyLoans }] =
    useLazyGetLoansQuery();
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState("2");

  const fetchLoans = React.useCallback(
    async (statusValue: string) => {
      try {
        const response = await getLoans({
          status: Number(statusValue),
        }).unwrap();
        console.log("Fetched loansAll:", response.data);
        if (response?.data) {
          setData(response.data.loans);
        }
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      }
    },
    [getLoans]
  );

  useEffect(() => {
    fetchLoans(status);
  }, [status, fetchLoans]);

  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>All Loan</h1>
          <p>Here is a view of your pending loan requests</p>
        </div>

        {/* <Link to="/ads-management/create" className={styles.createAddLink}>
          <Button
            variant="primary"
            size="md"
            icon={<CheckIcon />}
            iconPosition="left"
          >
            Create an Add
          </Button>
        </Link> */}
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
        <AllLoanTable data={data} onStatusChange={setStatus} />
      ) : null}
    </>
  );
}
