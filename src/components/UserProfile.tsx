// Example component showing how to access saved user data after login
import React from "react";
import { useAuth } from "../context/AuthContext";

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to view your profile</div>;
  }

  // You can also access user data from localStorage directly
  const userData = localStorage.getItem("devpay_admin_user");
  const token = localStorage.getItem("devpay_admin_token");
  let parsedUserData = null;

  try {
    parsedUserData = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h3>User Profile</h3>

      <div style={{ marginBottom: "10px" }}>
        <h4>From AuthContext:</h4>
        <p>
          <strong>Name:</strong> {user?.displayName || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "N/A"}
        </p>
        <p>
          <strong>UID:</strong> {user?.uid || "N/A"}
        </p>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <h4>From LocalStorage:</h4>
        <p>
          <strong>Name:</strong> {parsedUserData?.firstName}{" "}
          {parsedUserData?.lastName}
        </p>
        <p>
          <strong>Email:</strong> {parsedUserData?.email}
        </p>
        <p>
          <strong>Role:</strong> {parsedUserData?.role}
        </p>
        <p>
          <strong>ID:</strong> {parsedUserData?.id}
        </p>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <h4>Token Info:</h4>
        <p>
          <strong>Token Available:</strong> {token ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Raw User Data (for debugging):</h4>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {JSON.stringify(parsedUserData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default UserProfile;
