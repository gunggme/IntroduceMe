import React, { useState } from 'react';
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

  const handleSend = () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage = { text: input, type: 'user' };
    //setMessages([...messages, userMessage]);

    // 입력 필드 초기화
    setInput('');

    // 챗봇 응답 시뮬레이션
    const botMessage = { text: "This is a simulated response.", type: 'bot' };
    setMessages(prevMessages => [...prevMessages, userMessage, botMessage]);
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
