import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../context/useAuth";

import "./Auth.css";

function Register() {
  const {
    register,
    loginWithGoogle,
  } = useAuth();

  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [googleSubmitting, setGoogleSubmitting] =
    useState(false);

  const [googleWidth, setGoogleWidth] =
    useState(364);

  /* =========================================
     RESPONSIVE GOOGLE BUTTON WIDTH
  ========================================= */

  useEffect(() => {
    const updateGoogleWidth = () => {
      const availableWidth =
        window.innerWidth - 72;

      const width = Math.min(
        364,
        Math.max(200, availableWidth)
      );

      setGoogleWidth(width);
    };

    updateGoogleWidth();

    window.addEventListener(
      "resize",
      updateGoogleWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateGoogleWidth
      );
    };
  }, []);

  /* =========================================
     CREATE ACCOUNT
  ========================================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (password !== confirm) {
      setError(
        "Passwords do not match"
      );

      return;
    }

    setSubmitting(true);

    try {
      await register(
        name,
        email,
        password
      );

      navigate("/courses", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================
     GOOGLE REGISTER / LOGIN
  ========================================= */

  const handleGoogleSuccess = async (
    credentialResponse: {
      credential?: string;
    }
  ) => {
    if (!credentialResponse.credential) {
      setError(
        "Google signup failed. Please try again."
      );

      return;
    }

    setError("");
    setGoogleSubmitting(true);

    try {
      await loginWithGoogle(
        credentialResponse.credential
      );

      navigate("/courses", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to continue with Google"
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleSubmitting(false);

    setError(
      "Google signup failed. Please try again."
    );
  };

  return (
    <main className="auth-page">
      <section
        className="auth-card"
        aria-labelledby="register-title"
      >
        <span className="section-label">
          GET STARTED
        </span>

        <h1 id="register-title">
          Create your account
        </h1>

        <p>
          Save your learning progress with SyntaxHub.
        </p>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* =====================================
            CREATE ACCOUNT FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <label htmlFor="register-name">
            Name
          </label>

          <input
            id="register-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
            minLength={2}
            autoComplete="name"
          />

          <label htmlFor="register-email">
            Email
          </label>

          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            autoComplete="email"
          />

          <label htmlFor="register-password">
            Password
          </label>

          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={8}
            autoComplete="new-password"
          />

          <label htmlFor="register-confirm">
            Confirm password
          </label>

          <input
            id="register-confirm"
            type="password"
            value={confirm}
            onChange={(event) =>
              setConfirm(event.target.value)
            }
            required
            minLength={8}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={
              submitting ||
              googleSubmitting
            }
          >
            {submitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        {/* =====================================
            DIVIDER
        ===================================== */}

        <div
          className="auth-divider"
          aria-hidden="true"
        >
          <span>OR</span>
        </div>

        {/* =====================================
            GOOGLE REGISTER
        ===================================== */}

        <div
          className="auth-google"
          aria-label="Continue with Google"
        >
          <GoogleLogin
            onSuccess={
              handleGoogleSuccess
            }
            onError={
              handleGoogleError
            }
            useOneTap={false}
            text="continue_with"
            shape="rectangular"
            size="large"
            width={googleWidth}
          />
        </div>

        {googleSubmitting && (
          <p
            className="auth-loading"
            aria-live="polite"
          >
            Creating account with Google...
          </p>
        )}

        {/* =====================================
            LOGIN
        ===================================== */}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;