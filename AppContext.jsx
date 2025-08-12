import React, { createContext, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [userName, setUserName] = useLocalStorage("userName", "");
  const [contacts, setContacts] = useLocalStorage("contacts", []); // [{id, name}]
  const [messages, setMessages] = useLocalStorage("messages", {}); // {contactId: [{from, text, time}]}
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Add message for contact
  function addMessage(contactId, message) {
    setMessages((prev) => {
      const old = prev[contactId] || [];
      return { ...prev, [contactId]: [...old, message] };
    });
  }

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        contacts,
        setContacts,
        messages,
        addMessage,
        selectedContactId,
        setSelectedContactId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
