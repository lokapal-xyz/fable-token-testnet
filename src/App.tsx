import { Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger.tsx";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId="Fable Token"
      projectTitle="Fable Token"
      contentRight={
        <>
          <nav>
            <NavLink
              to="/debug"
              style={{
                textDecoration: "none",
              }}
            ></NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
