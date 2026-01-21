import React, { useState } from "react";
import { ReactComponent as CheckIcon } from "../../../assets/Ellipse1593.svg";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Button from "../../../ui/components/button/button";
import DemographicComponent from "../adsManagement/DemographicComponent";
import PreviewComponent from "../adsManagement/PreviewComponent";
import AdvertDetails from "../adsManagement/AdvertDetails";
import SuccessModal from "../../../ui/components/modal/SuccessModal";
import styles from "./styles.module.css";
import { useUpdateLoanProductMutation } from "../../../store/apiSlice";

const steps = [
  {
    id: 1,
    heading: "Loan Details",
    text: "Provide details of your loan product",
  },
  {
    id: 2,
    heading: "Interest Rates",
    text: "kindly set your interest rates",
  },
  {
    id: 3,
    heading: "Preview",
    text: "See how your loan product looks",
  },
];

interface InterestFee {
  id: string;
  name: string;
  amount: string;
}

interface LoanProductData {
  ageRange: string[];
  allowMultipleLoans: boolean;
  banner: any;
  budget: string;
  carousel: any[];
  code: string;
  cta: string;
  days: string;
  gender: string;
  interest: string[];
  interestComputationBasis: string;
  interestComputationFrequency: string;
  interestFeesTable: InterestFee[];
  interestRate: number;
  link: string;
  maxAge: string;
  maxLoanAmount: number;
  maxTenor: number;
  mediaType: string;
  minAge: number;
  minLoanAmount: string;
  minTenor: number;
  moratorium: number;
  name: string | undefined;
  notifyApprovers: boolean;
  paymentScheduleBreakdown: string;
  penaltyPercent: string;
  title: string;
  turnoverEligibility: string;
  upload: any;
  video: any;
}

export default function EditLoanProduct() {
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Get product data from location state or fetch from API
  const productFromState = location.state?.product;

  const [createData, setCreateData] = useState<LoanProductData>();
  const [updateLoanProduct, { isLoading }] = useUpdateLoanProductMutation();

  // Initial values from the product being edited
  const initialValues = productFromState
    ? {
        mediaType: "",
        title: "",
        link: "",
        cta: "",
        upload: null,
        carousel: [],
        banner: null,
        video: null,
        gender: "",
        interest: [productFromState.interestRate?.toString() || ""],
        ageRange: [],
        days: "",
        budget: "",
        name: productFromState.name || "",
        code: productFromState.shortName || "",
        minLoanAmount: productFromState.minAmount?.toString() || "",
        maxLoanAmount: productFromState.maxAmount?.toString() || "",
        minTenor: productFromState.minTenor?.toString() || "",
        maxTenor: productFromState.maxTenor?.toString() || "",
        minAge: "",
        maxAge: "",
        moratorium: productFromState.moratorium?.toString() || "",
        notifyApprovers: productFromState.notifyApprovalsViaEmail || false,
        interestRate: productFromState.interestRate?.toString() || "",
        penaltyPercent:
          productFromState.penaltyOnDefaultPrincipal?.toString() || "",
        turnoverEligibility:
          productFromState.turnoverEligibilityPercent?.toString() || "",
        interestComputationFrequency:
          productFromState.interestCostComputation?.toString() || "",
        interestComputationBasis:
          productFromState.interestComputationBasis === 0 ? "flat" : "reducing",
        paymentScheduleBreakdown:
          productFromState.paymentScheduleBreakdown?.toString() || "",
        allowMultipleLoans: false,
        interestFeesTable: [],
      }
    : {
        mediaType: "",
        title: "",
        link: "",
        cta: "",
        upload: null,
        carousel: [],
        banner: null,
        video: null,
        gender: "",
        interest: [],
        ageRange: [],
        days: "",
        budget: "",
        name: "",
        code: "",
        minLoanAmount: "",
        maxLoanAmount: "",
        minTenor: "",
        maxTenor: "",
        minAge: "",
        maxAge: "",
        moratorium: "",
        notifyApprovers: false,
        interestRate: "",
        penaltyPercent: "",
        turnoverEligibility: "",
        interestComputationFrequency: "",
        interestComputationBasis: "",
        paymentScheduleBreakdown: "",
        allowMultipleLoans: false,
        interestFeesTable: [],
      };

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleOnFormSubmit = async () => {
    console.log("Updating product", createData);
    const requestBody = {
      id: productFromState?.id || id,
      name: createData?.name ?? "",
      shortName: createData?.code ?? "",
      description: "string",
      interestRate: parseFloat(
        Number(createData?.interestRate || 0).toFixed(1),
      ),
      minAmount: Number(createData?.minLoanAmount) ?? "",
      maxAmount: Number(createData?.maxLoanAmount) ?? "",
      minTenor: Number(createData?.minTenor) ?? "",
      maxTenor: Number(createData?.maxTenor) ?? "",
      moratorium: Number(createData?.moratorium) ?? "",
      code: createData?.code ?? "",
      penaltyOnDefaultPrincipal: parseFloat(
        Number(createData?.penaltyPercent || 0).toFixed(1),
      ),
      notifyApprovalsViaEmail: createData?.notifyApprovers ?? false,
      turnoverEligibilityPercent: parseFloat(
        Number(createData?.turnoverEligibility || 0).toFixed(1),
      ),
      interestComputationBasis:
        createData?.interestComputationBasis === "flat" ? 0 : 1,
      interestCostComputation:
        Number(createData?.interestComputationFrequency) ?? 0,
      paymentScheduleBreakdown: 0,
      paymentScheduleType: 0,
    };

    console.log("Update request body", requestBody);

    try {
      const response = await updateLoanProduct(requestBody).unwrap();
      console.log("Update response", response);
      if (response.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error updating loan product:", error);
    }
  };

  return (
    <>
      <h1 className={styles.adHeading}>Edit Loan Product</h1>
      <div className={styles.container}>
        <aside className={styles.stepPanel}>
          <ul className={styles.stepList}>
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`${styles.stepItem} ${
                  index <= activeStep ? styles.active : ""
                }`}
                onClick={() => setActiveStep(index)}
              >
                <span className={styles.bullet}>
                  {index <= activeStep && (
                    <CheckIcon className={styles.checkIcon} />
                  )}
                </span>

                <div className={styles.stepContent}>
                  <p className={styles.stepHeading}>{step.heading}</p>
                  <p className={styles.stepDescription}>{step.text}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className={styles.arrow}></div>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object({})}
          onSubmit={(values) => {
            console.log("Final Submission", values);
            setCreateData(values as any);
            window.dispatchEvent(new CustomEvent("loanProductUpdated"));
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className={styles.form}>
              {activeStep === 0 && (
                <AdvertDetails values={values} setFieldValue={setFieldValue} />
              )}
              {activeStep === 1 && (
                <DemographicComponent
                  values={values}
                  setFieldValue={setFieldValue}
                />
              )}
              {activeStep === 2 && <PreviewComponent values={values} />}

              <div className={styles.buttonGroup}>
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    type="button"
                    size="lg"
                  >
                    Previous
                  </Button>
                )}
                {activeStep < steps.length - 1 ? (
                  <Button onClick={handleNext} type="button" size="lg">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleOnFormSubmit}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Product"}
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setActiveStep(0);
          navigate("/content-management");
        }}
        title="Loan Product Updated Successfully!"
        message="Your loan product has been updated successfully."
      />
    </>
  );
}
