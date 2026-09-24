import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { LumiraFullApp } from "./components/lumira/LumiraFullApp";

export function AppContent() {
  return <LumiraFullApp />;
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
