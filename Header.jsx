import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Header() {
  const { userName, setUserName } = useContext(AppContext);

  function handleChange(e) {
    setUserName(e.target.value);
  }

  return (
    <header className="p-4 border-b flex items-center justify-between bg-white">
      <input
        className="border rounded p-1 w-48"
        placeholder="Your name"
        value={userName}
        onChange={handleChange}
      />
      <h1 className="font-bold text-xl">Offline Chat P2P</h1>
      <div />
    </header>
  );
}
