import React from 'react'

function Button({
    children,
    type = "button",
    variant = "primary",
    size = "medium",
    disabled = false,
    onClick,
}) {
  return (
    <>
    <button 
       type={type}
       className={`common-button ${variant} ${size}`}
       disabled={disabled}
       onClick={onClick}
    >
        {children}
    </button>
    
    </>
  );
}

export default Button;