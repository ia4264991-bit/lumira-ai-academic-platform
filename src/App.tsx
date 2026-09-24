import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { HomeTwoTabs } from "./components/lumira/HomeTwoTabs";

export function AppContent() {
  return <HomeTwoTabs />;
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
