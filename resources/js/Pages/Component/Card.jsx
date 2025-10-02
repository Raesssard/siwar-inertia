import React from "react";
import "../../../css/card.css"
import { Link } from "@inertiajs/react";

export function StatCard({ href, border, color, title, value, icon }) {
    return (
        <Link href={href} className="text-decoration-none">
            <div className={`card ${border} shadow py-2 card-clickable`}>
                <div className="card-body">
                    <div className="row align-items-center">
                        {/* Text */}
                        <div className="col">
                            <div
                                className={`text-xs font-weight-bold ${color} text-uppercase mb-1`}
                            >
                                {title}
                            </div>
                            <div className="h4 mb-0 font-weight-bolder text-gray-800">
                                {value ?? 0}
                            </div>
                        </div>
                        {/* Icon */}
                        <div className="col-auto">
                            <i className={`${icon} fa-3x text-gray-400`}></i>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}