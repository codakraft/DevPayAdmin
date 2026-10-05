import UnpaidTable from "../components/UnpaidTable";
import styles from "../adsManagement/createAdd.module.css";
import AllCollectionsTable from "../components/AllCollectiosTable";
import React, { useEffect, useState } from "react";
import { useLazyGetLoansQuery } from "../../../store/apiSlice";
import { fetchAllPages, toPageResult } from "../../../helpers/pagination";

export default function OngoingCollections() {
  const [getLoans, { isLoading: isLoadingCompanyLoans }] =
    useLazyGetLoansQuery();
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState("0");

  const fetchLoans = React.useCallback(
    async (statusValue: string) => {
      try {
        // No status filter: this page has always listed every loan (status 0
        // used to be dropped from the request by mistake)
        const loans = await fetchAllPages(async (page, pageSize) =>
          toPageResult<any>(await getLoans({ page, pageSize }).unwrap(), "loans")
        );
        setData(loans);
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
