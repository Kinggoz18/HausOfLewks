import React, { useRef, useState } from "react";
import AuthAPI from "../../../storage/APIs/auth";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../Components/UIFeedback";
import useHandleOAuthRedirect from "../../hooks/handleOAuthRedirect";
import CustomButton from "../../Components/CustomButton";

import Logo from "../../images/haus_of_lewks_logo.png";
import { GoogleLoginBtn } from "../../Components/GoogleLoginBtn";
import { useNavigate } from "@remix-run/react";

export default function Login() {
  const authService = new AuthAPI();
  const [isLogin, setIsLogin] = useState(true);
  const [signupKey, setSignupKey] = useState("");
  const navigate = useNavigate();

  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const onLoginClick = async (mode) => {
    if (!isLogin && signupKey === "") {
      return handleThrowError("Sign up key is required");
    }

    try {
      if (!isLogin) {
        await authService.authenticateUser(mode, signupKey);
      } else {
        await authService.authenticateUser(mode);
      }
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  const handleThrowError = (message) => {
    setFeedbackMessage(message);
    toggleFeedback(errorRef);
  };

  /***************************** UseEffect hooks *************************/
  useHandleOAuthRedirect(handleThrowError);

  return (
    <div className="min-h-screen w-full top-0 left-0 overflow-y-auto flex flex-col primary-gradient fixed items-center px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12">
      {/* Logo */}
      <img 
        src={Logo} 
        alt="Haus of Lewks Logo" 
        className="w-28 sm:w-36 md:w-44 lg:w-[203px] mb-6 sm:mb-8" 
      />

      {/* Login Card */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center gap-y-6 sm:gap-y-8">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          {isLogin ? "Login" : "Sign up"}
        </h1>

        {isLogin ? (
          <div className="flex flex-col items-center gap-y-5 sm:gap-y-6 w-full">
            <GoogleLoginBtn
              onClick={() => onLoginClick("login")}
              label="Google Login"
            />

            <div className="flex flex-col items-center gap-y-3 text-sm sm:text-base">
              <span className="text-center">Don't have an account?</span>
              <CustomButton
                label={"Sign up"}
                onClick={() => setIsLogin(false)}
                className={"rounded-xl !bg-blue-400 !text-neutral-100 px-6 py-2"}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-y-5 sm:gap-y-6 w-full">
            <input
              className="text-neutral-900 outline-none focus:outline-none focus:ring-2 focus:ring-primary-purple py-3 px-4 sm:px-6 w-full rounded-2xl bg-neutral-100 text-sm sm:text-base placeholder:text-neutral-500"
              placeholder="Enter signup key"
              onChange={(e) => setSignupKey(e.target.value)}
              type="text"
            />
            <GoogleLoginBtn
              onClick={() => onLoginClick("signup")}
              label="Google Signup"
            />

            <div className="flex flex-col items-center gap-y-3 text-sm sm:text-base">
              <span className="text-center">Already have an account?</span>
              <CustomButton
                label={"Login"}
                onClick={() => setIsLogin(true)}
                className={"rounded-xl !bg-blue-400 !text-neutral-100 px-6 py-2"}
              />
            </div>
          </div>
        )}

        {/* Return Home Button */}
        <div className="flex flex-row w-full justify-center pt-2 sm:pt-4">
          <CustomButton
            label={"Return home"}
            onClick={() => navigate("/")}
            className={"rounded-xl bg-primary-purple !text-neutral-100 px-6 py-2 sm:px-8 sm:py-3"}
          />
        </div>
      </div>

      <SuccessFeedback
        ref={successRef}
        message={feedbackMessage}
      />
      <ErrorFeedback
        ref={errorRef}
        message={feedbackMessage}
      />
    </div>
  );
}
