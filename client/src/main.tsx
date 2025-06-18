import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home.tsx";

import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import VerifyCF from "./pages/VerifyCF.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import CreateBattle from "./pages/CreateBattle.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BattlePage from "./pages/BattlePage.tsx";
import ViewProblem from "./pages/ViewProblem.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "verify",
        element: <VerifyCF />,
      },
      {
        path: "create",
        element: <CreateBattle />,
      },
      {
        path: "battle/:battleId",
        element: <BattlePage />,
      },
    ],
  },
  {
    path: "view-problem/:contestId/:index",
    element: <ViewProblem />,
  },
]);

function Layout() {
  const auth = useAuth();

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-start">
      <div className="flex items-center py-4 mx-auto max-w-7xl w-9/12 flex-0">
        <div className="text-3xl font-bold text-gray-800">CPBattles</div>
        {!auth.loading && auth.authed && (
          <div className="ml-auto font-bold">{auth.handle}</div>
        )}
      </div>
      <Outlet />
    </div>
  );
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
