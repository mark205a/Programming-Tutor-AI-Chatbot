import { useState } from "react";
import "./App.css";

function App() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your AI Learning Tutor. Ask me a programming question to get started.",
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(){
    const question =  input.trim();

    if (question === "" || isLoading) {
      return;
    }

    const history = messages
    .slice(1)
    .slice(-12)
    .map((message) => ({
      role: message.role,
      text: message.text,
    }));

    setMessages((previousMessages) => [
      ...previousMessages,
      { role: "user", text: question },
    ]);
   
   setInput("");
   setIsLoading(true);

   try {
    const response = await fetch( "http://localhost:3000/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, history }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "An error occurred while processing your request.");
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      { role: "assistant", text: data.answer },
    ]);

   }catch (error) {
    console.error("Error sending message:", error);
    setMessages((previousMessages) => [
      ...previousMessages,
      { 
        role: "assistant", 
        text:  `Error: ${error.message}`,
      },
    ]);
   }finally {
    setIsLoading(false);
   }
  }

  function handleClearChat(){

    if (isLoading) {
      return;
    }

    setMessages([
      {
        role: "assistant",
        text: "Hello! I'm your AI Learning Tutor. Ask me a programming question to get started.",
      }
    ]);

    setInput("");

  }

  return (
    <div className="App">
      <header className="chat-header">
        <div className="avatar">AI</div>
        <h1>AI Learning Tutor</h1>
        <p>Your programming learning assistant</p>
        <button
          type="button"
          onClick={handleClearChat}
          disabled={isLoading}
        >
          Clear Chat
        </button>
        <div className="clr"></div>
      </header>
      <section className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role}`}
          >
            <span className="message-label">
              {message.role === "user" ? "You" : "AI Tutor"}
            </span>

            <div className="message-bubble">
              {message.text}
            </div>

          </div>
        ))}
        {isLoading && (
          <div className="message assistant" role="status" aria-live="polite">
            <span className="message-label">AI Tutor</span>
            <div className="message-bubble">Thinking...</div>
          </div>
        )}
      </section>

      <form 
        className="chat-input"
        onSubmit ={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >

        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a programming question..."
          aria-label="Ask a programming question"
          disabled={isLoading}
          rows={2}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" disabled={isLoading}>Send</button>

      </form>
    </div>
  );
}

export default App;
