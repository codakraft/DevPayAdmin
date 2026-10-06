import { ReactComponent as CheckIcon } from "../../../assets/create-add.svg";
import { Link } from "react-router-dom";
import AdsTable from "../components/AdsTable";
import Button from "../../../ui/components/button/button";
import styles from "../adsManagement/createAdd.module.css";
import LoanTable from "./product-table";
import { useLazyGetLoanProductQuery } from "../../../store/apiSlice";
import { fetchAllPages, toPageResult } from "../../../helpers/pagination";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Permissions } from "../../../helpers/auth";

export default function LoanProduct() {
  const [data, setData] = useState<{ loanProducts: any[] } | undefined>();

  const [getLoanProduct, { isLoading }] = useLazyGetLoanProductQuery();
  const { can } = useAuth();

  useEffect(() => {
    const fetchLoans = async () => {
      const loanProducts = await fetchAllPages(async (page, pageSize) =>
        toPageResult<any>(
          await getLoanProduct({ page, pageSize }).unwrap(),
          "loanProducts",
        ),
      );
      setData({ loanProducts });
    };
    fetchLoans();
  }, []);

  return (
    <>
      <div className={styles.headerFlex}>
        <div>
          <h1>Lending Products Gallery</h1>
          <p>Here is the info of your lending application</p>
        </div>

        {can(Permissions.ProductsManage) && (
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
        )}
      </div>

      {isLoading ? (
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
        <LoanTable data={data?.loanProducts} />
      ) : null}
      {/* <LoanTable /> */}
    </>
  );
}
