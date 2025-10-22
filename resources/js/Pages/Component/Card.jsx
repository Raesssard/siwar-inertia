import React from "react";
import "../../../css/card.css"
import { Link } from "@inertiajs/react";

export function StatCard({ href, color, title, value, icon }) {
    return (
        <div className="col-xl-3 col-md-6 mb-4">
            <div className={`card dashboard border-left-${color} shadow py-0 h-100 card-clickable`}>
                <Link href={href} className="text-decoration-none d-flex aling-item-center justify-content-center h-100">
                    <div className="card-body dashboard">
                        <div className="row no-gutters align-items-center">
                            {/* Text */}
                            <div className="col mr-2" style={{ zIndex: 20 }}>
                                <div
                                    className={`text-xs font-weight-bold text-${color} text-uppercase ${value ? "mb-1" : ""} text-align-start`}
                                >
                                    {title}
                                </div>
                                <div className="h4 mb-0 font-weight-bolder text-gray-800">
                                    {value ?? ""}
                                </div>
                            </div>
                            {/* Icon */}
                            <div className="col-auto" style={{
                                position: "absolute",
                                zIndex: 10,
                                width: '100%',
                            }}>
                                <i className={`fas fa-${icon} fa-3x text-gray-400`} style={{ marginLeft: 'auto', marginRight: '1.25rem', fontSize: '3rem' }}></i>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}