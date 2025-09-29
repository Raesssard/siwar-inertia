import React, { useState } from "react"
import '../../css/layout.css'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Topbar from "./Topbar"
import { ModalSidebar } from "../Pages/Component/Modal"

export default function layout({ children }) {
    const [toggle, setToggle] = useState("")
    const [showSidebar, setShowSidebar] = useState(false)

    const handleToggle = (t) => {
        setToggle(t)
    }

    const ModalSideShow = (condition) => {
        setShowSidebar(condition)
    }

    return (
        <>
            <div id="wrapper">
                <Sidebar toggleKeParent={handleToggle} />
                <ModalSidebar
                    modalIsOpen={showSidebar}
                    modalShow={ModalSideShow} />
                <div id="content-wrapper" className={`main-content d-flex flex-column ${toggle}`}>
                    <div id="content">
                        <Topbar
                            modalShow={ModalSideShow} />
                        <div className="container-fluid">
                            <div className="row">
                                {children}
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    )
}