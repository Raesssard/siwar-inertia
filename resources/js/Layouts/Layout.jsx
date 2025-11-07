import React, { useState, useEffect } from "react"
import "../../css/layout.css"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import Topbar from "./Topbar"
import { ModalSidebar } from "../Pages/Component/Modal"
import { usePage } from "@inertiajs/react"

export default function Layout({ children }) {
    const [toggle, setToggle] = useState(() => {
        return localStorage.getItem("sidebarCollapsed") === "true" ? "toggled" : ""
    })
    const [history, setHistory] = useState(false)
    const [showSidebar, setShowSidebar] = useState(false)
    const [flashMessage, setFlashMessage] = useState(null)
    const { flash } = usePage().props

    const toggleLocalStorage = () => {
        setHistory(true)
        setToggle("")
        localStorage.removeItem("sidebarCollapsed")
        localStorage.removeItem("openMenus")

        setTimeout(() => setHistory(false), 200)
    }

    const handleToggle = (t) => {
        setToggle(t)
    }

    const ModalSideShow = (condition) => {
        setShowSidebar(condition)
    }

    // 🔹 Tampilkan flash message ketika ada dari server
    useEffect(() => {
        if (flash?.success || flash?.error) {
            const message = {
                type: flash.success ? "success" : "error",
                text: flash.success || flash.error,
            }
            setFlashMessage(message)

            // Hilangkan otomatis setelah 3 detik
            const timer = setTimeout(() => setFlashMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [flash])

    return (
        <>
            <div id="wrapper">
                <Sidebar
                    toggleKeParent={handleToggle}
                    localStorageHistory={history}
                />
                <ModalSidebar
                    modalIsOpen={showSidebar}
                    modalShow={ModalSideShow}
                    localStorageHistory={history}
                />
                <div
                    id="content-wrapper"
                    className={`main-content d-flex flex-column ${toggle}`}
                >
                    <div id="content">
                        <Topbar
                            modalShow={ModalSideShow}
                            hapusHistory={() => toggleLocalStorage()}
                        />

                        {/* 🔹 Flash Message (Success / Error) */}
                        {flashMessage && (
                            <div
                                className={`position-fixed top-0 end-0 mt-3 me-3 px-4 py-2 rounded shadow-lg text-white fw-semibold z-50 ${flashMessage.type === "success"
                                    ? "bg-success"
                                    : "bg-danger"
                                    }`}
                                style={{
                                    animation: "fadeInOut 3s ease-in-out",
                                    zIndex: 9999,
                                }}
                            >
                                {flashMessage.type === "success" ? "✅ " : "❌ "}
                                {flashMessage.text}
                            </div>
                        )}

                        <div className="container-fluid">
                            <div className="row">{children}</div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>

            {/* 🔹 Animasi CSS sederhana */}
            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10%, 90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `}</style>
        </>
    )
}
