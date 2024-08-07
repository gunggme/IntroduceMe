import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.type === 'user' ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  background-color: ${props => (props.type === 'user' ? '#007bff' : '#e5e5e5')};
  color: ${props => (props.type === 'user' ? '#fff' : '#000')};
  padding: 15px;
  border-radius: 8px;
  max-width: 80%;
`;

const Message = ({ type, children }) => (
  <MessageContainer type={type}>
    <MessageBubble type={type}>{children}</MessageBubble>
  </MessageContainer>
);

export default Message;
