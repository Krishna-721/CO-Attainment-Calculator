export default function Header({ onMenu }) {
  return (
    <header className="flex h-[60px] items-center justify-between border-b border-line bg-[#151515] px-4 sm:h-[72px] sm:px-8">
      <button
        type="button"
        className="mr-3 border-0 bg-transparent text-xl text-ink md:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <div className="hidden w-[300px] rounded-lg border border-[#303030] bg-[#1e1e1e] px-3 py-2 text-[13px] text-subtle sm:block">
        ⌕ <span>Academic analytics</span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-accent text-[13px] font-bold">F</span>
        <div className="hidden sm:block">
          <b className="block text-xs">Faculty</b>
          <small className="block text-[10px] text-subtle">Academic workspace</small>
        </div>
      </div>
    </header>
  );
}
