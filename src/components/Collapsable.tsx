import React from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import "./ChatBubble.css";

export function Collapsible({ children, isOpen, onToggle }: { children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
  return (
    <div className="thinkTag">
			<div className="thinkButton" onClick={onToggle}>
				{isOpen ? "Masquer" : "Raisonnement"}
				{isOpen ? <ChevronUp /> : <ChevronDown />}
			</div>
      {isOpen && (
        <div className="thinkContent">
          {children}
        </div>
      )}
    </div>
  );
}
