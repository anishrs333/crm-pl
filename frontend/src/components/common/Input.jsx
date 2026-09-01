import React from 'react'

function Input({
    label,
    name,
    type = "text",
    placeholder = "",
    value,
    onChange,   
    error,
    required = false,
    disabled = false,
}) {
  return (
    <>
    <div className="common-input-group">
        {label && (
            <label htmlFor={name}>
                {label}

                {required && (
                    <span className="required-mark">
                        *
                    </span>
                )}
            </label>
        )}

        <input 
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={error ? "input-error" : ""}
        />

        {error &&(
            <span></span>
        )}
    </div>
    </>
  )
}

export default Input