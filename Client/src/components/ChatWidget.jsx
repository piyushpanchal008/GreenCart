import React, { useState, useRef, useEffect } from "react";

async function sendMessageToCopilot(messages) {
  try {
    const response = await fetch("/api/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) throw new Error("Failed to get AI response");

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);  // controls chat open/close
  const [messages, setMessages] = useState([
    { role: "system", content: "You are chatting with GreenCart assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const aiReply = await sendMessageToCopilot(updatedMessages);

    if (aiReply) {
      setMessages([...updatedMessages, aiReply]);
    } else {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        zIndex: 1000,
      }}
    >
      {isOpen ? (
        <div
          style={{
            width: 320,
            maxHeight: 400,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 10,
              borderBottom: "1px solid #ddd",
              fontWeight: "bold",
              fontSize: 16,
              backgroundColor: "#4CAF50",
              color: "white",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            GreenCart Assistant
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontWeight: "bold",
                fontSize: 18,
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          <div
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: 10,
              fontSize: 14,
              minHeight: 200,
              maxHeight: 320,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 8,
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 16,
                    backgroundColor: msg.role === "user" ? "#DCF8C6" : "#E6E6E6",
                    color: "#333",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    fontWeight: msg.role === "system" ? "bold" : "normal",
                    fontStyle: msg.role === "system" ? "italic" : "normal",
                  }}
                >
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: 10,
              borderTop: "1px solid #ddd",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
              style={{
                flexGrow: 1,
                padding: 8,
                borderRadius: 20,
                border: "1px solid #ccc",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                border: "none",
                color: "white",
                borderRadius: 20,
                cursor: loading ? "wait" : "pointer",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "#4CAF50",
            border: "none",
            color: "white",
            fontSize: 24,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
    </div>
  );
}
