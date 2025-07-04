import { ReactComponent as CheckIcon } from "../../../assets/create-add.svg";
import { Link } from "react-router-dom";
import AdsTable from "../components/AdsTable";
import Button from "../../../ui/components/button/button";
import styles from "../adsManagement/createAdd.module.css";
import LoanTable from "./product-table";

export default function LoanProduct() {
  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>Loan product</h1>
          <p>Here is the infoo of your lending application</p>
        </div>

        <Link to="/loan-product/creat-loan" className={styles.createAddLink}>
          <Button
            variant="primary"
            size="md"
            icon={<CheckIcon />}
            iconPosition="left"
          >
            Create new Loan Product
          </Button>
        </Link>
      </div>

      <LoanTable />
    </>
  );
}
