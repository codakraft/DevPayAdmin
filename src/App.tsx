import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/authentication/loginPage";

// Import dashboard pages
import Dashboard from "./pages/dashboard";
import UserManagement from "./pages/dashboard/userManagement/index";
import AdminManagement from "./pages/dashboard/adminManagement/index";
import FlaggedUsers from "./pages/dashboard/userManagement/flaggedUser";
import SuspendedUsers from "./pages/dashboard/userManagement/suspendedUsers";
import CreateAdmin from "./pages/dashboard/adminManagement/createAdmin";
import CreateRoles from "./pages/dashboard/adminManagement/rolePer";
import UserProfile from "./pages/dashboard/userManagement/userProfile";
import AdsManagement from "./pages/dashboard/adsManagement/AdsManagement";
import CreateAdd from "./pages/dashboard/adsManagement";
import AllLoan from "./pages/dashboard/loan";
import LoanProduct from "./pages/dashboard/loan-product/loanProduct";
import LoanProductManagement from "./pages/dashboard/loan-product/create-loan";
import AuditTrail from "./pages/dashboard/audit-trail";
import AdminUserProfile from "./pages/dashboard/adminManagement/admin-userprofile";
import LoanRequestPage from "./pages/dashboard/loanRequest";
import LoanDetails from "./pages/dashboard/loanRequest/loanDetails";
import LoanDetail from "./pages/dashboard/loan/loanDetail";
import UnpaidLoan from "./pages/dashboard/loan/unpaid-loan";
import OngoingCollections from "./pages/dashboard/loan/allCollection";
import Wallet from "./pages/dashboard/wallet";
import PaymentSuccess from "./pages/payment-success";
import Disburse from "./pages/dashboard/disbursements";
import AllDisbursements from "./pages/dashboard/disbursements/allDisbursements";
import DisbursementDetails from "./pages/dashboard/disbursements/details";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/user-management/all-users"
                element={<UserManagement />}
              />
              <Route
                path="/user-management/flagged-users"
                element={<FlaggedUsers />}
              />
              <Route
                path="/user-management/suspended-users"
                element={<SuspendedUsers />}
              />
              <Route
                path="/user-management/user-profile/:userId"
                element={<UserProfile />}
              />

              <Route path="/admin-management" element={<AdminManagement />} />
              <Route
                path="/admin-management/create"
                element={<CreateAdmin />}
              />
              <Route
                path="/admin-management/roles-permissions"
                element={<CreateRoles />}
              />
              <Route
                path="/admin-management/admin-userProfile/:userId"
                element={<AdminUserProfile />}
              />

              <Route path="/loan-management" element={<LoanRequestPage />} />
              <Route
                path="/loan-management/details/:userId"
                element={<LoanDetails />}
              />

              <Route
                path="/features/group-communities"
                element={<div>Group & Communities</div>}
              />
              <Route path="/features/hub" element={<div>Hub</div>} />
              <Route path="/features/forum" element={<div>Forum</div>} />

              <Route path="/ads-management" element={<CreateAdd />} />
              <Route
                path="/ads-management/create"
                element={<AdsManagement />}
              />
              <Route
                path="/loan-product/creat-loan"
                element={<LoanProductManagement />}
              />

              <Route path="/audit-trail/index" element={<AuditTrail />} />

              <Route path="/content-management" element={<LoanProduct />} />
              <Route path="/analytics" element={<div>Analytics</div>} />
              <Route
                path="/system-settings"
                element={<div>System Settings</div>}
              />

              <Route path="/loan" element={<AllLoan />} />
              <Route path="/loan/unpaid-loans" element={<UnpaidLoan />} />
              <Route path="/dashboard/loans/:id" element={<LoanDetail />} />
              <Route
                path="/loan/ongoing-collections"
                element={<OngoingCollections />}
              />

              <Route path="/disbursements/disburse" element={<Disburse />} />
              <Route path="/disbursements/all" element={<AllDisbursements />} />
              <Route
                path="/disbursements/details/:loanId"
                element={<DisbursementDetails />}
              />

              <Route path="/wallet" element={<Wallet />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
