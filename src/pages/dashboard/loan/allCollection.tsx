import UnpaidTable from "../components/UnpaidTable";
import styles from "../adsManagement/createAdd.module.css";
import AllCollectionsTable from "../components/AllCollectiosTable";
import React, { useEffect, useState } from "react";
import { useLazyGetLoansQuery } from "../../../store/apiSlice";

export default function OngoingCollections() {
  const [getLoans, { isLoading: isLoadingCompanyLoans }] =
    useLazyGetLoansQuery();
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState("0");

  const fetchLoans = React.useCallback(
    async (statusValue: string) => {
      try {
        const response = await getLoans({
          status: 0,
        }).unwrap();
        console.log("Fetched loanscollections:", response.data);
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
          <h1>All Ongoing Collections Report</h1>
          <p>Here is a view of your collections</p>
        </div>
      </div>

      <AllCollectionsTable data={data} />
    </>
  );
}
