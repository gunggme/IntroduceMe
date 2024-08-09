import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Message from './Message';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
`;

const MessagesArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
`;

const InputArea = styled.div`
  display: flex;
  border-top: 1px solid #ccc;
  background-color: #fff;
`;

const InputField = styled.input`
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 0;
  outline: none;
  font-size: 16px;
`;

const SendButton = styled.button`
  padding: 15px 30px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
`;

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const websocket = useRef(null);

  useEffect(() => {
    const createThread = async () => {
      const response = await fetch('http://localhost:8000/create_thread', { method: 'POST' });
      const data = await response.json();
      const threadId = data.thread_id;

      websocket.current = new WebSocket(`ws://localhost:8000/ws/${threadId}`);
      websocket.current.onmessage = (event) => {
        const botMessage = { text: event.data, type: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      };

      websocket.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    };

    createThread();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, type: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (websocket.current) {
      websocket.current.send(input);
    }

    setInput('');
  };

  return (
    <ChatContainer>
      <MessagesArea>
        {messages.map((msg, index) => (
          <Message key={index} type={msg.type}>
            {msg.text}
          </Message>
        ))}
      </MessagesArea>
      <InputArea>
        <InputField
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <SendButton onClick={handleSend}>Send</SendButton>
      </InputArea>
    </ChatContainer>
  );
};

export default Chatbot;
