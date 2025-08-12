import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import QRGenerator from "../components/QRGenerator";
import QRScanner from "../components/QRScanner";
import usePeerConnection from "../hooks/usePeerConnection";

export default function Home() {
  const {
    contacts,
    setContacts,
    userName,
    addMessage,
    setSelectedContactId,
  } = useContext(AppContext);

  const [isCaller, setIsCaller] = useState(null); // null = no choice yet
  const [qrData, setQrData] = useState(null);
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [scanError, setScanError] = useState(null);

  // onMessage callback receives incoming message
  function onMessage(data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "message") {
        const { from, text } = parsed;
        // save message under from contact
        addMessage(from, {
          from: parsed.from,
          text,
          time: Date.now(),
        });
      }
    } catch {}
  }

  const {
    createOffer,
    receiveOffer,
    receiveAnswer,
    sendMessage,
    connectionState,
  } = usePeerConnection(onMessage);

  // Caller flow: generate offer SDP and show QR
  async function startCall() {
    setIsCaller(true);
    const offer = await createOffer();
    setQrData(offer);
    setWaitingAnswer(true);
  }

  // Callee flow: scan offer QR, generate answer QR
  async function handleScan(data) {
    setScanError(null);
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      if (isCaller && waitingAnswer) {
        // Caller scanning answer
        await receiveAnswer(parsed);
        setWaitingAnswer(false);
        setQrData(null);
        alert("Connected!");
        return;
      }

      if (!isCaller) {
        // Callee scanning offer
        setIsCaller(false);
        const answer = await receiveOffer(parsed);
        setQrData(answer);
        setWaitingAnswer(false);
        alert("Scan this QR to caller");
        // Add contact on answerer side
        const contactId = parsed.sdp.substring(0, 8); // some unique id from sdp
        setContacts((prev) => [
          ...prev,
          { id: contactId, name: "Unknown Contact" },
        ]);
        setSelectedContactId(contactId);
        return;
      }
    } catch (e) {
      setScanError("Invalid QR scanned");
    }
  }

  // For demo, add a contact on caller side after connected
  useEffect(() => {
    if (connectionState === "connected" && isCaller) {
      // Add contact with some unique id for caller side
      setContacts((prev) => {
        if (prev.length > 0) return prev; // only one for demo
        return [{ id: "peer1", name: "Connected Peer" }];
      });
      setSelectedContactId("peer1");
    }
  }, [connectionState, isCaller, setContacts, setSelectedContactId]);

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="mb-4 text-xl font-semibold">Connect with a peer</h2>
      {isCaller === null && (
        <div className="space-x-4">
          <button
            onClick={() => setIsCaller(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Call (Create Offer)
          </button>
          <button
            onClick={() => setIsCaller(false)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Scan QR to Answer
          </button>
        </div>
      )}

      {isCaller && waitingAnswer && (
        <>
          <p className="my-2">Show this QR to peer to scan:</p>
          <QRGenerator data={qrData} />
          <p className="my-2">Then scan their answer QR:</p>
          <QRScanner onScan={handleScan} />
        </>
      )}

      {isCaller === false && qrData && (
        <>
          <p className="my-2">Scan this QR with caller:</p>
          <QRGenerator data={qrData} />
        </>
      )}

      {isCaller === false && !qrData && (
        <>
          <p className="my-2">Scan caller QR to start:</p>
          <QRScanner onScan={handleScan} />
          {scanError && <p className="text-red-500">{scanError}</p>}
        </>
      )}
    </div>
  );
}
