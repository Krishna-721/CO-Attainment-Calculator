const items = [
  { label: "Dashboard", path: "/", icon: "▦" },
  { label: "Courses", path: "/courses", icon: "▣" },
  { label: "Students", path: "/students", icon: "◉" },
];

export default function Sidebar({ path, navigate, close, open }) {
  const attainmentActive =
    path === "/attainment" || path.startsWith("/attainment/");

  const isActive = (item) =>
    path === item.path ||
    (item.path === "/courses" && path.startsWith("/courses/"));

  const handleNavigate = (destination) => {
    navigate(destination);
    close?.();
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-60 flex-none border-r border-line bg-[#1b1b1b] p-6 transition-transform duration-200 md:sticky md:z-0 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-9 ml-2 grid gap-0.5">
        <strong className="text-[19px] tracking-[-0.04em]">
          <i className="text-accent not-italic">R</i>UBRIX
        </strong>
        <span className="text-[10px] font-bold tracking-[0.17em] text-subtle">CO ATTAINMENT</span>
      </div>

      <p className="mb-2 ml-2 text-[10px] font-bold tracking-[0.17em] text-subtle">Overview</p>
      <nav className="grid gap-1">
        {items.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`rounded-md border-0 px-3 py-2.5 text-left text-sm transition-colors ${isActive(item) ? "bg-accent text-white" : "bg-transparent text-muted hover:bg-[#242424] hover:text-ink"}`}
            onClick={() => handleNavigate(item.path)}
          >
            <span className={`mr-2 inline-block w-[22px] ${isActive(item) ? "text-white" : "text-accent"}`}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className={`rounded-md border-0 px-3 py-2.5 text-left text-sm transition-colors ${attainmentActive ? "bg-accent text-white" : "bg-transparent text-muted hover:bg-[#242424] hover:text-ink"}`}
          onClick={() => handleNavigate("/attainment")}
        >
          <span className={`mr-2 inline-block w-[22px] ${attainmentActive ? "text-white" : "text-accent"}`}>◔</span>
          Attainment
        </button>
      </nav>

      <p className="absolute bottom-7 ml-2 text-[11px] leading-relaxed text-subtle">
        Academic analytics
        <br />
        for outcome-based learning.
      </p>
    </aside>
  );
}
