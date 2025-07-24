import React, { useState } from "react";
import { ReactComponent as CheckIcon } from "../../../assets/Ellipse1593.svg";
import { useNavigate } from "react-router-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import Button from "../../../ui/components/button/button";
import DemographicComponent from "../adsManagement/DemographicComponent";
import PreviewComponent from "../adsManagement/PreviewComponent";
import AdvertDetails from "../adsManagement/AdvertDetails";
import SuccessModal from "../../../ui/components/modal/SuccessModal";
import styles from "./styles.module.css";
import { useCreateLoanProductMutation } from "../../../store/apiSlice";

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
  //   {
  //     id: 3,
  //     heading: "Duration",
  //     text: "Select duration of your loan",
  //   },
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
  banner: any; // Use a more specific type if available
  budget: string;
  carousel: any[]; // Use a more specific type if available
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
  upload: any; // Use a more specific type if available
  video: any; // Use a more specific type if available
}

export default function LoanProductManagement() {
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  type CreateDataType = {
    name?: string;
    shortName?: string;
    description?: string;
    interestRate?: number | string;
    minAmount?: number | string;
    maxAmount?: number | string;
    minTenor?: number | string;
    maxTenor?: number | string;
    moratorium?: number | string;
    code: string;
    // Add other fields as needed
  };

  const [createData, setCreateData] = useState<LoanProductData>();

  const [createLoanProduct, { isLoading }] = useCreateLoanProductMutation();

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleOnFormSubmit = async () => {
    console.log("here", createData);
    const requestBody = {
      // companyId: "6f2e993b-26c9-4175-9021-cdf1106d8466",
      name: createData?.name ?? "",
      shortName: createData?.code ?? "",
      description: "string",
      interestRate: Number(createData?.interest) ?? 0,
      minAmount: Number(createData?.minLoanAmount) ?? "",
      maxAmount: Number(createData?.maxLoanAmount) ?? "",
      minTenor: Number(createData?.minTenor) ?? "",
      maxTenor: Number(createData?.maxTenor) ?? "",
      moratorium: Number(createData?.moratorium) ?? "",
      code: createData?.code ?? "",
      penaltyOnDefaultPrincipal: Number(createData?.penaltyPercent) ?? 0,
      notifyApprovalsViaEmail: createData?.notifyApprovers ?? false,
      turnoverEligibilityPercent: Number(createData?.turnoverEligibility) ?? 0,
      interestComputationBasis:
        createData?.interestComputationBasis === "flat" ? 0 : 1,
      interestCostComputation:
        Number(createData?.interestComputationFrequency) ?? 0,
      paymentScheduleBreakdown: 0,
      paymentScheduleType: 0,
    };
    console.log("requestBody", requestBody);
    try {
      const response = await createLoanProduct(requestBody).unwrap();
      console.log("res", response);
      if (response.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error creating loan product:", error);
    }
  };
  return (
    <>
      <h1 className={styles.adHeading}>Create a new loan product</h1>
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
          initialValues={{
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
            // Loan product fields
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
          }}
          validationSchema={Yup.object({})}
          onSubmit={(values) => {
            console.log("Final Submission", values);
            setCreateData(values as any);
            // Save to localStorage for loan products
            // const existingProducts = JSON.parse(
            //   localStorage.getItem("createdLoanProducts") || "[]"
            // );
            // const newProduct = {
            //   id: String(Date.now()).slice(-4), // Generate a simple ID from timestamp
            //   organization: values.name || "Unnamed Product",
            //   interestRate: values.interestRate
            //     ? `${values.interestRate}%`
            //     : "0%",
            //   loanRange: `${values.minLoanAmount || 0} - ${
            //     values.maxLoanAmount || 0
            //   }`,
            //   loanTenor: values.maxTenor
            //     ? `${values.maxTenor} months`
            //     : "0 months",
            //   status: "Active",
            //   createdAt: new Date().toISOString(),
            //   formData: values, // Store all form values for future reference
            // };

            // const updatedProducts = [...existingProducts, newProduct];
            // console.log("createRequest", updatedProducts);
            // localStorage.setItem(
            //   "createdLoanProducts",
            //   JSON.stringify(updatedProducts)
            // );

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent("loanProductCreated"));

            // setShowSuccessModal(true);
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
              {/* {activeStep === 2 && (
                <DurationComponent
                  values={values}
                  setFieldValue={setFieldValue}
                />
              )} */}
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
                    {isLoading ? "...loading" : "Submit"}
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>{" "}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setActiveStep(0); // Reset to first step after closing modal
          navigate("/content-management"); // Navigate back to loan product page
        }}
        title="Loan Product Created Successfully!"
        message="Your loan product has been created successfully and is now available for use."
      />
    </>
  );
}
