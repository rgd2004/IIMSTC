import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../utils/api";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error("❌ Google auth error:", error);
      toast.error("Google login failed: " + error);
      navigate("/login");
      return;
    }

    if (!token) {
      console.warn("⚠️ No token in Google callback");
      toast.error("Authentication failed: no token received");
      navigate("/login");
      return;
    }

    console.log("✓ Google callback: token received, fetching user...");
    localStorage.setItem("token", token);

    api.get("/auth/me")
      .then((res) => {
        console.log("✓ Got user from /auth/me:", res.data.user);
        login(token, res.data.user);
        toast.success("Google Login Successful!");
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        console.error("❌ Failed to fetch user after Google auth:", err);
        toast.error("Authentication Failed");
        localStorage.removeItem("token");
        navigate("/login");
      });

  }, [searchParams, navigate, login]);

  return <div style={{ textAlign: 'center', paddingTop: '50vh' }}>Logging in with Google...</div>;
};

export default GoogleAuthCallback;
