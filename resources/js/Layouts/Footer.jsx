import React from "react";

export default function Footer() {
  return (
    <footer className="sticky-footer">
      <div className="footer-container">
        <div className="copyright text-center my-auto">
          <span>&copy; WargaKita {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
