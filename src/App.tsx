import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

// ✅ Context Providers
import { DashboardProvider } from "./components/context/DashboardContext";
import { AuthProvider } from "./components/context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <AppRoutes />
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;














// import { BrowserRouter } from "react-router-dom";
// import AppRoutes from "./routes/AppRoutes"

// function App() {
//   return (
//     <BrowserRouter>
//       <AppRoutes />
//     </BrowserRouter>
//   );
// }

// export default App;