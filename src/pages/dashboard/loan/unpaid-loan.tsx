import UnpaidTable from "../components/UnpaidTable";
import styles from "../adsManagement/createAdd.module.css";

export default function UnpaidLoan() {
  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>Unpaid Loan Report</h1>
          <p>Here is a view of your pending loan requests</p>
        </div>
      </div>

      <UnpaidTable />
    </>
  );
}
