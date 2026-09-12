import { useEffect, useState } from "react";

export default function EntityForm({
  title,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  busy,
  error,
}) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const change = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="grid w-full gap-4 rounded-xl border border-accent bg-panel p-5" onSubmit={submit}>
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="m-0 text-base">{title}</h3>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-xl text-muted hover:bg-[#2a2a2a] hover:text-ink"
          onClick={onCancel}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        {fields.map((field) => (
          <label className="grid gap-1.5 text-xs text-muted" key={field.name}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                className="w-full rounded-md border border-[#303030] bg-[#121212] p-2.5 text-ink outline-none focus:border-accent"
                required={field.required !== false}
                value={values[field.name] ?? ""}
                onChange={(event) => change(field.name, event.target.value)}
                placeholder={field.placeholder}
                rows="3"
              />
            ) : field.type === "select" ? (
              <select
                className="w-full rounded-md border border-[#303030] bg-[#121212] p-2.5 text-ink outline-none focus:border-accent"
                required={field.required !== false}
                value={values[field.name] ?? ""}
                onChange={(event) => change(field.name, event.target.value)}
              >
                <option value="" disabled>
                  {field.placeholder || `Select ${field.label.toLowerCase()}`}
                </option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w-full rounded-md border border-[#303030] bg-[#121212] p-2.5 text-ink outline-none focus:border-accent"
                required={field.required !== false}
                type={field.type || "text"}
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.name] ?? ""}
                onChange={(event) => change(field.name, event.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}
      </div>

      {error && (
        <p         className="m-0 text-[13px] text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button type="button" className="rounded-md border border-[#303030] bg-[#202020] px-3 py-2 text-xs font-bold text-muted hover:border-[#3d3d3d] hover:bg-[#262626] hover:text-ink" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="rounded-md bg-accent px-4 py-2.5 text-[13px] font-bold text-white hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
