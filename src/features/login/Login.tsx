"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, LoginFormValues } from "@/schemas/loginSchema";
import { useLoginMutation } from "@/query/useLoginMutation";
import { loginResponseToSession, writeAuthSessionFromStorage } from "@/lib/authSessionStorage";
import styles from "./page.module.scss";

function getLoginErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return "Login endpoint not found (404). Check NEXT_PUBLIC_MOCK_API_BASE_URL and your mock route.";
    }

    if (error.response?.status) {
      return `Login failed (HTTP ${error.response.status}).`;
    }

    return "Network error. Check your internet connection and mock API URL.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Login failed. Check your mock login endpoint and try again.";
}

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onValidSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        writeAuthSessionFromStorage(loginResponseToSession(data, values.email));
        toast.success("Login successful.");
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(getLoginErrorMessage(error));
      },
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPane}>
        <div className={styles.brandInner}>
          <Image
            className={styles.brandLogo}
            src="/logo.svg"
            alt="lendsqr"
            width={174}
            height={36}
            style={{ height: "auto" }}
            priority
          />
          <Image
            className={styles.heroImage}
            src="/images/pablosign.png"
            alt=""
            width={600}
            height={338}
            priority
          />
        </div>
      </section>

      <section className={styles.formPane}>
        <div className={styles.formInner}>
          <div className={styles.mobileLogo}>
            <Image
              className={styles.mobileLogoImg}
              src="/logo.svg"
              alt="lendsqr"
              width={174}
              height={36}
              style={{ height: "auto" }}
              priority
            />
          </div>

          <header className={styles.formHeader}>
            <h1>Welcome!</h1>
            <p>Enter details to login.</p>
          </header>

          <form
            className={styles.form}
            onSubmit={handleSubmit(onValidSubmit)}
            noValidate
          >
            <label className={styles.field}>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder=" "
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={
                    errors.email ? "login-email-error" : undefined
                  }
                  className={errors.email ? styles.inputInvalid : undefined}
                  {...register("email")}
                />
                <span className={styles.floatingLabel}>Email</span>
              </div>
              {errors.email ? (
                <span id="login-email-error" className={styles.fieldError}>
                  {errors.email.message}
                </span>
              ) : null}
            </label>

            <label className={styles.field}>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder=" "
                  aria-invalid={errors.password ? "true" : undefined}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  className={errors.password ? styles.inputInvalid : undefined}
                  {...register("password")}
                />
                <span className={styles.floatingLabel}>Password</span>
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              {errors.password ? (
                <span id="login-password-error" className={styles.fieldError}>
                  {errors.password.message}
                </span>
              ) : null}
            </label>

            <button className={styles.forgotPassword} type="button">
              FORGOT PASSWORD?
            </button>

            <button
              className={styles.loginButton}
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
