import { useState, useEffect, useRef, useCallback } from "react";

const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function usePeerConnection(onMessage) {
  const pc = useRef(null);
  const dataChannel = useRef(null);
  const [connectionState, setConnectionState] = useState("disconnected");

  // Create PeerConnection and DataChannel (for caller)
  const createOffer = useCallback(async () => {
    pc.current = new RTCPeerConnection(configuration);
    dataChannel.current = pc.current.createDataChannel("chat");
    dataChannel.current.onopen = () => setConnectionState("connected");
    dataChannel.current.onclose = () => setConnectionState("disconnected");
    dataChannel.current.onmessage = (e) => onMessage(e.data);

    pc.current.onicecandidate = (e) => {
      if (e.candidate === null) {
        // ICE gathering complete
        // Offer is ready after setLocalDescription resolves
      }
    };

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    return pc.current.localDescription;
  }, [onMessage]);

  // Answerer receives offer SDP and returns answer SDP
  const receiveOffer = useCallback(
    async (offerSdp) => {
      pc.current = new RTCPeerConnection(configuration);

      pc.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onopen = () => setConnectionState("connected");
        dataChannel.current.onclose = () => setConnectionState("disconnected");
        dataChannel.current.onmessage = (e) => onMessage(e.data);
      };

      pc.current.onicecandidate = (e) => {
        if (e.candidate === null) {
          // ICE complete
        }
      };

      await pc.current.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      return pc.current.localDescription;
    },
    [onMessage]
  );

  // Caller receives answer SDP
  const receiveAnswer = useCallback(async (answerSdp) => {
    if (!pc.current) return;
    await pc.current.setRemoteDescription(new RTCSessionDescription(answerSdp));
  }, []);

  const sendMessage = useCallback((message) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(message);
    }
  }, []);

  // Close connection cleanup
  const closeConnection = useCallback(() => {
    if (dataChannel.current) dataChannel.current.close();
    if (pc.current) pc.current.close();
    dataChannel.current = null;
    pc.current = null;
    setConnectionState("disconnected");
  }, []);

  return {
    createOffer,
    receiveOffer,
    receiveAnswer,
    sendMessage,
    connectionState,
    closeConnection,
  };
}
