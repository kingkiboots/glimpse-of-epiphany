import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { ExhibitDraftContext } from "./exhibit-draft-context";
import type { ExhibitDraftContextValue } from "./types";

/**
 * 작성(compose) 화면과 미리보기(confirm) 화면이 같은 사진·메시지를 바라보게 하는 저장소.
 * File 객체는 URL로 직렬화할 수 없어 라우터 search param으로 넘길 수 없기 때문에
 * 라우트 바깥(RootLayout)에 두어 페이지 이동에도 값이 유지되도록 한다.
 */
const ExhibitDraftProvider = ({ children }: PropsWithChildren) => {
  const [file, setFileState] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 렌더 중이 아니라 이벤트 핸들러에서 object URL을 만들고 해제한다.
  // effect에서 만들면 StrictMode의 이중 마운트 때 해제만 되고 다시 만들어지지 않는다.
  const previewUrlRef = useRef<string | null>(null);

  const setFile = useCallback((next: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const url = next ? URL.createObjectURL(next) : null;

    previewUrlRef.current = url;
    setPreviewUrl(url);
    setFileState(next);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setMessage("");
  }, [setFile]);

  // 앱이 내려갈 때 남아 있는 URL 정리
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const value = useMemo<ExhibitDraftContextValue>(
    () => ({ file, message, previewUrl, setFile, setMessage, reset }),
    [file, message, previewUrl, setFile, reset],
  );

  return (
    <ExhibitDraftContext.Provider value={value}>
      {children}
    </ExhibitDraftContext.Provider>
  );
};

export default ExhibitDraftProvider;
