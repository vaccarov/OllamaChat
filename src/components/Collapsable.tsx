import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import "./ChatBubble.css";

export function Collapsible({ children }: { children: React.ReactNode}) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="thinkTag">
			<div className="thinkButton" onClick={() => setOpen(!open)}>
				{open ? "Masquer" : "Raisonnement"}
				{open ? <ChevronUp /> : <ChevronDown />}
			</div>
      {open && (
        <div className="thinkContent">
          {children}
        </div>
      )}
    </div>
  );
}
