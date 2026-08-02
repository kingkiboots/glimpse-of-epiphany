import { useAdminSession } from "@/features/admin-auth";
import ExhibitsPage from "@/pages/exhibits";
import LoginPage from "@/pages/login";

/**
 * 화면이 둘뿐이고 URL로 진입할 이유가 없어 라우터를 두지 않았다.
 * 로그인 여부가 곧 화면을 결정한다.
 */
const App = () => {
  const { session, isReady, signOut } = useAdminSession();

  // 저장된 세션을 확인하는 사이 로그인 화면이 깜빡이는 것을 막는다.
  if (!isReady) {
    return null;
  }

  if (!session) {
    return <LoginPage />;
  }

  return <ExhibitsPage onSignOut={() => void signOut()} />;
};

export default App;
