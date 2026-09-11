import { useEffect, useState } from "react"

export default function EntityForm({
  title,
  fields,
  initialValues,
  onSubmit,
  onCancel,
  busy,
  error,
}) {
  const [values, setValues] = useState(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const change = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <form className="entity-form" onSubmit={submit}>
      <div className="form-head">
        <h3>{title}</h3>
        <button
          type="button"
          className="icon-button"
          onClick={onCancel}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <div className="form-fields">
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                required={field.required !== false}
                value={values[field.name] ?? ""}
                onChange={(event) => change(field.name, event.target.value)}
                placeholder={field.placeholder}
                rows="3"
              />
            ) : (
              <input
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

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  )
}
