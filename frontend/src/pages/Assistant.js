import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for making API calls

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSend = async () => {
    if (input.trim() !== "") {
      const newMessage = { text: input, sender: "user", timestamp: new Date().toLocaleTimeString() };
      setMessages([...messages, newMessage]);

      try {
        // Prepare FormData for file upload (if any) along with user input
        const formData = new FormData();
        formData.append("prompt", input);
        if (file) {
          formData.append("file", file);
        }

        // Send the input to the backend API (which will call the Gemini API)
        const response = await axios.post("http://localhost:5000/api/gemini/ask", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // After receiving the response from your backend (Gemini AI), update the chat
        const assistantReply = {
          text: response.data.reply || "Sorry, no response from AI.", // Assuming the response from Gemini contains a field called 'reply'
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, assistantReply]);
      } catch (error) {
        console.error("Error with AI response:", error.response || error);
        const assistantReply = {
          text: "Sorry, there was an error with the AI response. Please try again.",
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, assistantReply]);
      }

      setInput("");
      setFile(null); // Reset file after sending
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setFile(null);
  };

  useEffect(() => {
    // Scroll to the bottom of the message container when a new message is added
    const messageContainer = document.querySelector(".messageContainer");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={styles.container}>
      <button style={styles.refreshButton} onClick={handleNewChat}>
        New Chat
      </button>

      <div className="messageContainer" style={styles.messageContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={message.sender === "user" ? styles.userMessage : styles.assistantMessage}
            >
              <p style={styles.messageText}>{message.text}</p>
              <p style={styles.timestamp}>{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <div style={styles.fileUploadButton}>
          <input
            type="file"
            accept=".csv"
            style={styles.fileInput}
            onChange={handleFileUpload}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={styles.plusSymbol}>
            +
          </label>
        </div>

        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me something..."
          style={styles.inputField}
        />

        <button style={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#333',
    height: '100vh',
    justifyContent: 'flex-end',
    width: '70%',
    margin: '0 auto',
    position: 'relative',
  },
  refreshButton: {
    backgroundColor: '#000080',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    position: 'absolute',
    top: '20px',
    left: '20px',
  },
  messageContainer: {
    width: '100%',
    maxWidth: '500px',
    overflowY: 'auto',
    maxHeight: '600px',
    marginBottom: '80px',
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  userMessage: {
    backgroundColor: '#B0C4DE',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '70%',
    minWidth: '50%',
    wordWrap: 'break-word',
  },
  assistantMessage: {
    backgroundColor: '#f7f7f7',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '70%',
    minWidth: '50%',
    wordWrap: 'break-word',
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  timestamp: {
    fontSize: '0.8rem',
    color: 'gray',
    marginTop: '5px',
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    position: 'absolute',
    bottom: '20px',
  },
  fileUploadButton: {
    backgroundColor: '#fff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: '10px',
  },
  plusSymbol: {
    fontSize: '20px',
    color: '#000',
  },
  fileInput: {
    display: 'none',
  },
  inputField: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  sendButton: {
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Assistant;
