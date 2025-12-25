import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";
import toast from "react-hot-toast";

const AuthGoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    const processLogin = async () => {
      console.log("\n🔐 ========== GOOGLE SUCCESS PAGE ==========");
      
      if (error) {
        console.error("❌ Google auth error:", error);
        toast.error("Google login failed: " + error);
        console.log("🔐 ==========================================\n");
        navigate("/login");
        return;
      }

      if (!token) {
        console.warn("⚠️ No token in URL params");
        console.log("   URL:", window.location.href);
        toast.error("Authentication failed: no token");
        console.log("🔐 ==========================================\n");
        navigate("/login");
        return;
      }

      console.log("✅ Token received from URL");
      console.log("   Token preview:", token.substring(0, 20) + "...");

      // Save token temporarily
      localStorage.setItem("token", token);
      console.log("✅ Token saved to localStorage");

      try {
        console.log("🔄 Fetching user data via /auth/me...");
        const res = await authAPI.me();
        console.log("✅ User data received:", res.data);

        if (res.data.success || res.data.user) {
          console.log("✅ User authenticated successfully");
          console.log("   Name:", res.data.user.name);
          console.log("   Email:", res.data.user.email);
          login(token, res.data.user);
          toast.success("Google Login Successful!");
          console.log("✅ Redirecting to dashboard...");
          console.log("🔐 ==========================================\n");
          navigate("/dashboard", { replace: true });
        } else {
          console.error("❌ Invalid response from /auth/me:", res.data);
          toast.error("Failed to load user info");
          console.log("🔐 ==========================================\n");
          navigate("/login");
        }

      } catch (error) {
        console.error("❌ AuthGoogleSuccess error:", error.message);
        console.error("   Error response:", error.response?.data);
        console.error("   Status:", error.response?.status);
        toast.error(error.response?.data?.message || "Google login failed");
        localStorage.removeItem("token");
        console.log("🔐 ==========================================\n");
        navigate("/login");
      }
    };

    processLogin();
  }, [navigate, login]);

  return <h2 style={{ textAlign: 'center', paddingTop: '50vh' }}>Logging you in...</h2>;
};

export default AuthGoogleSuccess;
