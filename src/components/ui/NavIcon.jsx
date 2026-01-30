import React from "react";

const NavIcon = ({ icon, active }) => (
    <button className={`p-2 transition-colors ${active ? 'text-lavender' : 'text-overlay0 hover:text-subtext'}`}>
        {React.cloneElement(icon, { size: 24, fill: active ? 'currentColor' : 'none' })}
    </button>
);

export default NavIcon;
