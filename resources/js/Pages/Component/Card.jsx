import React from "react";
import "../../../css/card.css"
import { Link } from "@inertiajs/react";

export function StatCard({ href, color, title, value, icon }) {
    return (
        <div className="col-xl-3 col-md-6 mb-4">
            <div className={`card border-left-${color} shadow py-2 h-100 card-clickable`}>
                <Link href={href} className="text-decoration-none d-flex aling-item-center justify-content-center">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            {/* Text */}
                            <div className="col mr-2">
                                <div
                                    className={`text-xs font-weight-bold text-${color} text-uppercase mb-1 text-align-start`}
                                >
                                    {title}
                                </div>
                                <div className="h4 mb-0 font-weight-bolder text-gray-800">
                                    {value ?? 0}
                                </div>
                            </div>
                            {/* Icon */}
                            <div className="col-auto">
                                <i className={`fas fa-${icon} fa-3x text-gray-400`} style={{ fontSize: '3rem' }}></i>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}