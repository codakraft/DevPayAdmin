import UnpaidTable from "../components/UnpaidTable";
import styles from "../adsManagement/createAdd.module.css";
import AllCollectionsTable from "../components/AllCollectiosTable";

export default function OngoingCollections() {
  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>All Ongoing Collections Report</h1>
          <p>Here is a view of your collections</p>
        </div>
      </div>

      <AllCollectionsTable />
    </>
  );
}
