import React, { useState } from "react";
import TextEditor from "./TextEditor";
import { ReactComponent as CloseImageUpload } from "../../../assets/CloseImageUpload.svg";
import { ReactComponent as UploadImage } from "../../../assets/UploadImage.svg";
import { ReactComponent as AddImage } from "../../../assets/AddImage.svg";
import { ReactComponent as UploadVideo } from "../../../assets/UploadVideo.svg";
import { AdFormValues } from "./formik-types/formikTypes";
import styles from "./AdvertDetails.module.css";

interface Props {
  values: AdFormValues;
  setFieldValue: (field: keyof AdFormValues, value: any) => void;
}

const mediaOptions = ["Single Image", "Carousel", "Banner", "Video", "Text"];

export default function AdvertDetails({ values, setFieldValue }: Props) {
  const [carouselImages, setCarouselImages] = useState<(File | null)[]>(
    values.carousel?.length ? values.carousel : [null]
  );

  const handleMediaSelect = (option: string) => {
    setFieldValue("mediaType", option);
    if (option !== "Carousel") setCarouselImages([]);
    if (option === "Carousel") setCarouselImages([null]);
  };

  const selectedMedia = values.mediaType;

  return (
    <div className={styles.wrapper}>
      {/* Loan Product Details Fields */}
      <div
        className={styles.loanProductGrid}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "32px",
          background: "#faf9fd",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Name
          </label>
          <input
            type="text"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="Enter product name"
            value={values.name || ""}
            onChange={(e) => setFieldValue("name", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Code
          </label>
          <input
            type="text"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="Enter product code"
            value={values.code || ""}
            onChange={(e) => setFieldValue("code", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Minimum Loan Amount
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 100000"
            value={values.minLoanAmount || ""}
            onChange={(e) => setFieldValue("minLoanAmount", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Maximum Loan Amount
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 1000000"
            value={values.maxLoanAmount || ""}
            onChange={(e) => setFieldValue("maxLoanAmount", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Minimum Tenor (In months)
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 6"
            value={values.minTenor || ""}
            onChange={(e) => setFieldValue("minTenor", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Maximum Tenor (In months)
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 24"
            value={values.maxTenor || ""}
            onChange={(e) => setFieldValue("maxTenor", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Min Age For Applicants
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 21"
            value={values.minAge || ""}
            onChange={(e) => setFieldValue("minAge", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Max Age For Applicants
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 60"
            value={values.maxAge || ""}
            onChange={(e) => setFieldValue("maxAge", e.target.value)}
          />
        </div>
        <div>
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Moratorium (In Days)
          </label>
          <input
            type="number"
            className={styles.titleInput}
            style={{ width: "120%", maxWidth: "100%" }}
            placeholder="e.g. 30"
            value={values.moratorium || ""}
            onChange={(e) => setFieldValue("moratorium", e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <label
            className={styles.option}
            style={{ fontWeight: 600, marginBottom: 8 }}
          >
            Notify Approvers Via Email?
          </label>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <input
                type="radio"
                name="notifyApprovers"
                value="yes"
                checked={values.notifyApprovers === true}
                onChange={() => setFieldValue("notifyApprovers", true)}
              />
              Yes
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <input
                type="radio"
                name="notifyApprovers"
                value="no"
                checked={values.notifyApprovers === false}
                onChange={() => setFieldValue("notifyApprovers", false)}
              />
              No
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
