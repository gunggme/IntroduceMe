import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Message from './Message';
import ReactMarkdown from 'react-markdown';

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
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);
  const websocket = useRef(null);
  const webSocketURL = "ws://localhost:8000/ws/";

  useEffect(() => {
    const createThread = async () => {
      console.log("실행시작");
      const response = await fetch('http://localhost:8000/create_thread', { method: 'POST' });
      const data = await response.json();
      const tempThreadId = JSON.stringify(data.thread_id.id).replace('\"', '').replace('\"', '');
      websocket.current = new WebSocket(webSocketURL + tempThreadId);

      websocket.current.onmessage = (event) => {
        const newMessagePart = event.data;
        setIsReceiving(true);
        setCurrentBotMessage((prev) => prev + newMessagePart);
      };

      websocket.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    };

    createThread();
  }, []);

  useEffect(() => {
    if (isReceiving) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].type === 'bot') {
          updatedMessages[updatedMessages.length - 1].text = currentBotMessage;
        } else {
          updatedMessages.push({ text: currentBotMessage, type: 'bot' });
        }
        return updatedMessages;
      });
    }
  }, [currentBotMessage]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (isReceiving) {
      setIsReceiving(false);
      setCurrentBotMessage('');
    }

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
            {msg.type === 'bot' ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              msg.text
            )}
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
