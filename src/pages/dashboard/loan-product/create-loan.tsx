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
import { getErrorMessage } from "../../../helpers/auth";
import {
  buildLoanProductBody,
  LoanProductFormValues,
  validateLoanProduct,
} from "./loanProductRequest";
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

export default function LoanProductManagement() {
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createLoanProduct, { isLoading }] = useCreateLoanProductMutation();

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleOnFormSubmit = async (values: LoanProductFormValues) => {
    setSubmitError(null);
    const validationError = validateLoanProduct(values);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    try {
      await createLoanProduct(buildLoanProductBody(values)).unwrap();
      setShowSuccessModal(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to create loan product."));
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
          onSubmit={(values) => handleOnFormSubmit(values)}
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

              {submitError && activeStep === steps.length - 1 && (
                <p className={styles.submitError}>{submitError}</p>
              )}
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
