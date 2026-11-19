import { Navigate, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import WorkspacePage from "./pages/WorkspacePage";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import ClientDashboard from "./pages/ClientDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AssistantLayout from "./components/layout/AssistantLayout";
import ClientLayout from "./components/layout/ClientLayout";

import { useAuth } from "./context/AuthContext";

import ConnectAccount from "./pages/ConnectAccount";
import Accounts from "./pages/Accounts";
import ClientThread from "./pages/ClientThread";

import ThreadDetail from "./pages/ThreadDetail";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6">Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={user.role === "client" ? "/client" : "/app"}
      replace
    />
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Assistant routes */}

<Route element={<ProtectedRoute allowedRoles={["assistant"]} />}>
  <Route path="/app" element={<AssistantLayout />}>
    <Route index element={<Dashboard />} />

    <Route path="inbox" element={<Inbox />} />
    <Route path="priority" element={<Inbox />} />
    <Route path="waiting" element={<Inbox />} />
    <Route path="archive" element={<Inbox />} />

    <Route path="threads/:id" element={<ThreadDetail />} />

    <Route path="connect" element={<ConnectAccount />} />
    <Route path="accounts" element={<Accounts />} />
  </Route>
</Route>

      {/* Client routes */}
      {/* <Route
        element={
          <ProtectedRoute allowedRoles={["client"]} />
        }
      >
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
        </Route>
      </Route> */}
<Route element={<ProtectedRoute allowedRoles={["client"]} />}>
  <Route path="/client" element={<ClientLayout />}>
    <Route index element={<ClientDashboard />} />
    <Route path="threads/:id" element={<ClientThread />} />
  </Route>
</Route>


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;