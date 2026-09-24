import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { HomeTwoTabs } from "./components/lumira/HomeTwoTabs";
import { ErrorBoundary } from "./components/lumira/ErrorBoundary";

export function AppContent() {
  return (
    <ErrorBoundary>
      <HomeTwoTabs />
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
