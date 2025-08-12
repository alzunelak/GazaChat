import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import usePeerConnection from "../hooks/usePeerConnection";

export default function Chat() {
  const { selectedContactId, addMessage, userName } = useContext(AppContext);

  // Dummy onMessage that stores messages - real WebRTC connection to be passed in a better way
  function onMessage(data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "message") {
        addMessage(selectedContactId, {
          from: parsed.from,
          text: parsed.text,
          time: Date.now(),
        });
      }
    } catch {}
  }

  const { sendMessage, connectionState } = usePeerConnection(onMessage);

  function handleSend(text) {
    // Send over WebRTC data channel
    const messageObj = {
      type: "message",
      from: userName || "me",
      text,
    };
    sendMessage(JSON.stringify(messageObj));
    addMessage(selectedContactId, {
      from: "me",
      text,
      time: Date.now(),
    });
  }

  if (!selectedContactId) {
    return <div className="p-4">Select a contact first</div>;
  }

  return (
    <div className="flex flex-col flex-grow border-l">
      <ChatWindow />
      <MessageInput onSend={handleSend} />
      <div className="p-2 text-sm text-gray-500">Connection: {connectionState}</div>
    </div>
  );
}
