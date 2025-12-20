import { useEffect } from "react";
import { useNavigate } from "react-router";
import { addPersistData } from "../../storage/persistData";
import AuthAPI from "../../storage/APIs/auth";

/**
 * Intersection observer hook
 * @param handleAuthErrorFunc Handler function to throw error
 * @returns void
 */
const useHandleOAuthRedirect = (handleAuthErrorFunc) => {
  const authAPI = new AuthAPI();
  const navigate = useNavigate();

  const handleAuthRedirect = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const authId = queryParams.get("userId");
      const token = queryParams.get("token");
      const authError = queryParams.get("authError");

      if (authError) {
        throw new Error(authError);
      }

      if (authId && token) {
        const user = await authAPI.getAuthenticatedUser(authId);
        if (user?._id) {
          addPersistData("user", JSON.stringify(user));
          addPersistData("csrf-token", JSON.stringify(token));

          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 400);
        }
      }
    } catch (error) {
      handleAuthErrorFunc(error?.message);
      // Only log in development mode
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.error('OAuth redirect error:', error);
      }
    }
  };

  useEffect(() => {
    handleAuthRedirect();
  }, []);
};

export default useHandleOAuthRedirect;
