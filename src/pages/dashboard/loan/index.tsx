import { ReactComponent as CheckIcon } from "../../../assets/create-add.svg";
import { Link } from "react-router-dom";
import AdsTable from "../components/AdsTable";
import Button from "../../../ui/components/button/button";
import styles from "../adsManagement/createAdd.module.css";
import AllLoanTable from "../components/AllLoansTable";

export default function AllLoan() {
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

      <AllLoanTable />
    </>
  );
}
