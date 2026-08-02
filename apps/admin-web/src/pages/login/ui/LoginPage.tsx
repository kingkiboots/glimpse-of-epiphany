import { useId, useState, type FormEventHandler } from "react";
import { signInAdmin } from "@packages/api";
import styles from "./LoginPage.module.css";
import HelpDialog from "@/shared/ui/HelpDialog";

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
        <div className={styles.titleRow}>
          <h1 className={styles.title}>전시물 관리</h1>
          <HelpDialog title="계정은 어떻게 받나요?" label="계정 안내">
            <p>계정은 Supabase 대시보드에서 직접 발급합니다.</p>
            <ol>
              <li>
                Authentication &gt; Users &gt; <strong>Add user</strong>
              </li>
              <li>
                이메일과 비밀번호를 입력하고{" "}
                <strong>Auto Confirm User를 켭니다.</strong> 끄면 메일 인증을
                기다리느라 로그인되지 않습니다.
              </li>
              <li>
                Authentication &gt; Sign In / Providers &gt; Email 에서
                <strong> 가입 허용은 꺼둡니다.</strong> 열어두면 누구나 계정을
                만들어 사진 삭제 권한을 얻습니다.
              </li>
            </ol>
            <p data-callout>
              &#8251; 당최 무슨 말인지 모르겠다구요? 개발자에게 연락주세요.
              <a href="tel:01044490677">김기현 010-4449-0677</a>
            </p>
            <p>
              로그인하면 지금 화면에 전시 중인 사진을 볼 수 있고, 부적절한
              사진을 즉시 내릴 수 있습니다.{" "}
              <strong>삭제는 되돌릴 수 없습니다.</strong>
            </p>
          </HelpDialog>
        </div>
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
