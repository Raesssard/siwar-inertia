import React from "react";
import { useIsMobile } from "../Pages/Component/GetPropRole";

export default function Footer() {
  const mobile = useIsMobile()
  return (
    <footer className="sticky-footer" style={mobile ? { padding: "0" } : {}}>
      <div className="footer-container">
        <div className="copyright text-center my-auto">
          <span>&copy; WargaKita {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
