import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MainRouter } from "./routers/MainRouter";
import { BackToTop } from "./components/BackToTop";
import { GOOGLE_OAUTH_PROVIDER_CLIENT_ID } from "./constants";

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId={GOOGLE_OAUTH_PROVIDER_CLIENT_ID}>
        <Routes>
          <Route path="*" element={<MainRouter />} />
        </Routes>
        <BackToTop />
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
