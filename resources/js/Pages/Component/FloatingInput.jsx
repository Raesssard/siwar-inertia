import React, { useState } from "react";


export default function FloatingInput({ label, type = "text", value, onChange, icon, toggleable = false, }) {
    const [show, setShow] = useState(false);
    const inputType = toggleable ? (show ? "text" : "password") : type;
    const hasValue = value && value.length > 0;

    return (
        <div className="position-relative w-100 mb-4" style={{ height: "56px" }}>
            {/* Icon kiri (posisi tengah vertikal) */}
            {icon && (
                <i
                    className={`bi ${icon} position-absolute text-secondary`}
                    style={{
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "1rem",
                    }}
                ></i>
            )}

            {/* Input */}
            <input
                type={inputType}
                value={value}
                onChange={onChange}
                placeholder=" "
                className="form-control border rounded-3 h-100"
                style={{
                    paddingLeft: icon ? "2.5rem" : "1rem",
                    paddingRight: toggleable ? "2.5rem" : "1rem",
                    paddingTop: "1.25rem",
                    paddingBottom: "0.5rem",
                    boxShadow: "none",
                    transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => e.target.classList.add("border-primary")}
                onBlur={(e) => e.target.classList.remove("border-primary")}
            />

            {/* Label (melayang seperti Tailwind) */}
            <label
                className="position-absolute text-secondary px-1"
                style={{
                    background: 'transparent',
                    left: icon ? "2.5rem" : "1rem",
                    top: hasValue ? "6px" : "50%",
                    transform: hasValue ? "none" : "translateY(-50%)",
                    fontSize: hasValue ? "0.75rem" : "1rem",
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                }}
            >
                {label}
            </label>

            {/* Tombol show/hide password */}
            {toggleable && (
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="btn position-absolute p-0 border-0 bg-transparent text-secondary"
                    style={{
                        right: "12px",
                        top: "25%",
                        transform: "translateY(-50%)",
                        fontSize: "1.1rem",
                    }}
                >
                    <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
            )}
        </div>
    )
}