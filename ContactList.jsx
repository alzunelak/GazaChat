import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function ContactList() {
  const { contacts, setSelectedContactId, selectedContactId } =
    useContext(AppContext);

  return (
    <div className="overflow-auto border-r w-64">
      {contacts.length === 0 && (
        <div className="p-4 text-gray-500">No contacts connected</div>
      )}
      {contacts.map(({ id, name }) => (
        <div
          key={id}
          onClick={() => setSelectedContactId(id)}
          className={`cursor-pointer p-3 border-b ${
            selectedContactId === id ? "bg-blue-200" : "hover:bg-gray-100"
          }`}
        >
          {name || id}
        </div>
      ))}
    </div>
  );
}
