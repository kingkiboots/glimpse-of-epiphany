import { useId, useState, type FormEventHandler } from "react";
import { signInAdmin } from "@packages/api";
import styles from "./LoginPage.module.css";

/**
 * 관리자 계정 하나로만 들어온다. 회원가입 경로는 두지 않으며,
 * 계정은 Supabase 대시보드에서 직접 만든다.
 */
const LoginPage = () => {
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signInAdmin(email, password);
      // 로그인에 성공하면 세션 구독이 화면을 바꾼다.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>전시물 관리</h1>
        <p className={styles.caption}>삶으로 쓰는 예배전(展)</p>

        <label className={styles.label} htmlFor={emailId}>
          이메일
        </label>
        <input
          id={emailId}
          className={styles.input}
          type="email"
          value={email}
          autoComplete="username"
          required
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className={styles.label} htmlFor={passwordId}>
          비밀번호
        </label>
        <input
          id={passwordId}
          className={styles.input}
          type="password"
          value={password}
          autoComplete="current-password"
          required
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
