const items = [
  { label: "Dashboard", path: "/", icon: "▦" },
  { label: "Courses", path: "/courses", icon: "▣" },
  { label: "Students", path: "/students", icon: "◉" },
]

export default function Sidebar({ path, navigate, close }) {
  const attainmentActive =
    path === "/attainment" || path.startsWith("/attainment/")

  const isActive = (item) =>
    path === item.path ||
    (item.path === "/courses" && path.startsWith("/courses/"))

  const handleNavigate = (destination) => {
    navigate(destination)
    close?.()
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <strong><i>R</i>UBRIX</strong>
        <span>CO ATTAINMENT</span>
      </div>

      <p className="nav-label">Overview</p>
      <nav>
        {items.map((item) => (
          <button
            key={item.path}
            type="button"
            className={isActive(item) ? "nav-item active" : "nav-item"}
            onClick={() => handleNavigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className={attainmentActive ? "nav-item active" : "nav-item"}
          onClick={() => handleNavigate("/attainment")}
        >
          <span>◔</span>
          Attainment
        </button>
      </nav>

      <p className="sidebar-note">
        Academic analytics
        <br />
        for outcome-based learning.
      </p>
    </aside>
  )
}
