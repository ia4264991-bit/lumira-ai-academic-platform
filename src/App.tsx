import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { LumiraFullApp } from "./components/lumira/LumiraFullApp";
import { ErrorBoundary } from "./components/lumira/ErrorBoundary";

export function AppContent() {
  return (
    <ErrorBoundary>
      <LumiraFullApp />
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
