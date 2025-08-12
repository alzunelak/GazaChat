import React from "react";
import QRCode from "qrcode.react";

export default function QRGenerator({ data }) {
  if (!data) return null;
  const jsonString = JSON.stringify(data);
  return (
    <div className="p-4 bg-white rounded shadow">
      <QRCode value={jsonString} size={200} />
    </div>
  );
}
