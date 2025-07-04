import { ReactComponent as CheckIcon } from "../../../assets/create-add.svg";
import { Link } from "react-router-dom";
import AdsTable from "../components/AdsTable";
import Button from "../../../ui/components/button/button";
import styles from "./styles.module.css";
import LoanRequestTable from "./components/loanTable";

export default function LoanRequestPage() {
  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>Loan Request</h1>
          <p>Here is a view of your pending loan requests</p>
        </div>
      </div>

      <LoanRequestTable />
    </>
  );
}
