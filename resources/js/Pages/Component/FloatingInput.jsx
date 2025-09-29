import React, { useState } from "react";


export default function FloatingInput({ label, type = "text", value, onChange, icon, toggleable = false, }) {
    const [show, setShow] = useState(false);
    const inputType = toggleable ? (show ? "text" : "password") : type;
    return (
        <div className="relative w-full mb-4">
            {/* Icon kiri */}
            {icon && (
                <i
                    className={`bi ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-800`}
                ></i>
            )}

            {/* Input */}
            <input
                type={inputType}
                value={value}
                onChange={onChange}
                placeholder=" " // <- wajib, biar label bisa geser
                className="peer w-full border rounded-lg px-10 pt-4 pb-2 
                   placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Label */}
            <label
                className="absolute left-10 text-gray-800 transition-all
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
          peer-placeholder-shown:text-base
          peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-500
          top-1 text-sm"
            >
                {label}
            </label>
            {toggleable && (
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800"
                >
                    <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
            )}
        </div>
    )
}