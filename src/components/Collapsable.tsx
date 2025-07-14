import React from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import "./ChatBubble.css";

interface CollapsibleProps {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function Collapsible({ children, isOpen, onToggle }: CollapsibleProps): React.ReactElement {
  console.log('OOO Collapsible');
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
