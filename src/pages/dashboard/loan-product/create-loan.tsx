import React, { useState } from "react";
import { ReactComponent as CheckIcon } from "../../../assets/Ellipse1593.svg";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import Button from "../../../ui/components/button/button";
import DemographicComponent from "../adsManagement/DemographicComponent";
import DurationComponent from "../adsManagement/DurationComponent";
import PreviewComponent from "../adsManagement/PreviewComponent";
import AdvertDetails from "../adsManagement/AdvertDetails";
import styles from "./styles.module.css";

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

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

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
            mediaType: "", // <-- changed here from [] to ""
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
          }}
          validationSchema={Yup.object({})}
          onSubmit={(values) => {
            console.log("Final Submission", values);
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
                  <Button type="submit">Submit</Button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
