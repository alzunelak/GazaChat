import React from "react";

export default function ConnectionStatus({ status }) {
  const color =
    status === "connected"
      ? "text-green-600"
      : status === "connecting"
      ? "text-yellow-600"
      : "text-red-600";

  return <div className={`p-2 font-semibold ${color}`}>Status: {status}</div>;
}
