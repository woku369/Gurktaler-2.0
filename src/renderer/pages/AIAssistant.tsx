import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AIChat from "@/renderer/components/AIChat";

function AIAssistant() {
  const navigate = useNavigate();

  const handleOpenSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="h-screen flex flex-col">
      <AIChat onOpenSettings={handleOpenSettings} />
    </div>
  );
}

export default AIAssistant;
