import React from "react";
import { cn } from "@/lib/utils";

const GlassCard = ({ children, className = "" }) => (
    <div className={cn("bg-surface0/70 backdrop-blur-md border border-white/10 rounded-[32px]", className)}>
        {children}
    </div>
);

export default GlassCard;
