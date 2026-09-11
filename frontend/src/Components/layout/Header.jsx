export default function Header({ onMenu }) {
  return (
    <header className="header">
      <button
        type="button"
        className="menu-button"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <div className="search">
        ⌕ <span>Academic analytics</span>
      </div>

      <div className="profile">
        <span>F</span>
        <div>
          <b>Faculty</b>
          <small>Academic workspace</small>
        </div>
      </div>
    </header>
  )
}
