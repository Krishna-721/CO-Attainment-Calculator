import { useEffect, useState } from "react";

import Sidebar from "./Components/layout/Sidebar";
import Header from "./Components/layout/Header";
import Attainment from "./pages/Attainment";
import CourseWorkspace from "./pages/CourseWorkspace";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";

function useRouter() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to) => {
    if (to === window.location.pathname) return;

    window.history.pushState({}, "", to);
    setPath(to);
  };

  return { path, navigate };
}

function getPage(path, navigate) {
  const courseMatch = path.match(/^\/courses\/(\d+)$/);
  const attainmentMatch = path.match(/^\/attainment\/(\d+)$/);

  if (path === "/courses") return <Courses navigate={navigate} />;
  if (courseMatch) {
    return <CourseWorkspace courseId={courseMatch[1]} navigate={navigate} />;
  }
  if (path === "/students") return <Students />;
  if (path === "/attainment") return <Attainment navigate={navigate} />;
  if (attainmentMatch) {
    return <Attainment courseId={attainmentMatch[1]} navigate={navigate} />;
  }

  return <Dashboard navigate={navigate} />;
}

export default function App() {
  const { path, navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div
        className={`fixed inset-0 z-20 bg-black/60 ${menuOpen ? "block" : "hidden"} md:hidden`}
        onClick={() => setMenuOpen(false)}
      />
      <Sidebar
        path={path}
        navigate={navigate}
        close={() => setMenuOpen(false)}
        open={menuOpen}
      />
      <div className="min-w-0 flex-1">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[1450px] p-4 sm:p-6 lg:p-9">{getPage(path, navigate)}</main>
      </div>
    </div>
  );
}
