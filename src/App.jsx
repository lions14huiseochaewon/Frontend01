import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import NavigationBarLayout from "./layouts/NavigationBarLayout";
import useAuthStore from "./store/useAuthStore";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import Items from "./pages/Items";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import QRRental from "./pages/QRRental";
import Signup from "./pages/Signup";

function LayoutWithGNB() {
  return (
    <div>
      <Outlet />
      <NavigationBarLayout />
    </div>
  );
}

function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWithGNB />}>
            <Route path="/home" element={<Home />} />
            <Route path="/items" element={<Items />} />
            <Route path="/qr-rental" element={<QRRental />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Route>
      </Routes>
      <Toast />
    </>
  );
}

export default App;
