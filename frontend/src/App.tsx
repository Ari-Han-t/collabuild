import "@/styles/globals.css";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { useAppSelector } from "./hooks/useRedux";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditorPage } from "./pages/EditorPage";

const AppContent: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [currentPage, setCurrentPage] = useState<
    "login" | "dashboard" | "editor"
  >("login");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (token) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("login");
    }
  }, [token]);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage("editor");
  };

  const handleBack = () => {
    setCurrentPage("dashboard");
  };

  return (
    <>
      {currentPage === "login" && (
        <LoginPage onSuccess={() => setCurrentPage("dashboard")} />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage onProjectSelect={handleProjectSelect} />
      )}
      {currentPage === "editor" && selectedProjectId && (
        <EditorPage projectId={selectedProjectId} onBack={handleBack} />
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
