import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const { selectedContactId } = useContext(AppContext);

  function handleSend() {
    if (!text.trim() || !selectedContactId) return;
    onSend(text.trim());
    setText("");
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="p-2 border-t flex">
      <textarea
        rows={1}
        className="flex-grow resize-none p-2 border rounded"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={!selectedContactId}
      />
      <button
        className="ml-2 bg-blue-500 text-white px-4 rounded disabled:opacity-50"
        onClick={handleSend}
        disabled={!selectedContactId || !text.trim()}
      >
        Send
      </button>
    </div>
  );
}
