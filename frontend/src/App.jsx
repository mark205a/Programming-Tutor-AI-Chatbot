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
        body: JSON.stringify({ question }),
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


  return (
    <div className="App">
      <header className="chat-header">
        <div className="avatar">AI</div>
        <div>AI Learning Tutor</div>
        <p>Your programming learning assistant</p>
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
        />
        <button type="submit" disabled={isLoading}>Send</button>

      </form>
    </div>
  );
}

export default App;
