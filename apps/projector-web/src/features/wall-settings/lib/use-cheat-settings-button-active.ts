import { useEffect, useState } from "react";

export const useCheatSettingsButtonActive = () => {
  const [isCheatActive, setIsCheatActive] = useState<boolean>(false);

  // 치트키 입력 감지
  useEffect(() => {
    const secretCode = "config";
    let inputBuffer = "";
    // 타이머 ID의 타입을 지정합니다. 브라우저/Node 환경 모두 호환되도록 ReturnType을 사용합니다.
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // window 객체에 붙는 이벤트이므로 React.KeyboardEvent가 아닌 표준 DOM KeyboardEvent를 사용합니다.
    const handleKeyDown = (e: globalThis.KeyboardEvent): void => {
      const key = e.key.toLowerCase();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const expectedNextChar = secretCode[inputBuffer.length];

      if (key === expectedNextChar) {
        inputBuffer += key;
      } else if (key === secretCode[0]) {
        inputBuffer = key;
      } else {
        inputBuffer = "";
      }

      if (inputBuffer === secretCode) {
        setIsCheatActive((prev) => !prev);
        inputBuffer = "";
      } else if (inputBuffer.length > 0) {
        timeoutId = setTimeout(() => {
          inputBuffer = "";
          console.log("5초 경과: 입력이 초기화되었습니다.");
        }, 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 활성화 후 5초 뒤 자동 비활성화
  useEffect(() => {
    if (!isCheatActive) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    timeoutId = setTimeout(() => {
      setIsCheatActive(false);
    }, 5000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isCheatActive]);

  return { isCheatActive };
};
