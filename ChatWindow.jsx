import React, { useContext, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";

export default function ChatWindow() {
  const { selectedContactId, messages } = useContext(AppContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContactId]);

  if (!selectedContactId) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-400">
        Select a contact to chat
      </div>
    );
  }

  const chatMessages = messages[selectedContactId] || [];

  return (
    <div className="flex flex-col flex-grow p-4 overflow-y-auto">
      {chatMessages.map(({ from, text, time }, idx) => (
        <div
          key={idx}
          className={`mb-2 max-w-xs p-2 rounded ${
            from === "me" ? "bg-blue-400 text-white self-end" : "bg-gray-300"
          }`}
        >
          <div>{text}</div>
          <div className="text-xs text-right mt-1">
            {new Date(time).toLocaleTimeString()}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
