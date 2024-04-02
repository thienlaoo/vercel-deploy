import { useEffect, useState, useRef } from 'react';
import './Chat.scss';
import socket from "../../helpers/socket.ts";
import { useParams } from "react-router-dom";

interface TxInfo {
    Txid: string;
    Date: string;
    Amount: string;
    WalletFrom: string;
    WalletTo: string;
}

interface Message {
    text: string;
    sender: string;
    senderId: string;
    roomId: string | undefined;
    tx: TxInfo | null;
}

export const Chat = () => {
    const { roomId, name } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket.emit('join-room', roomId, name);
        socket.on('receive-message', (receivedMessage: Message) => {
            console.log('Получено сообщение:', receivedMessage);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        socket.on('user-connected', ({ name, message, roomId: userRoomId }) => {

            console.log(message);
            const newUserMessage: Message = {
                text: `User ${message} connected`,
                sender: 'System',
                senderId: name,
                roomId: userRoomId,
                tx: null
            };
            if (!messages.find(m => m.text === newUserMessage.text)) {
                setMessages((prevMessages) => [...prevMessages, newUserMessage]);
            }

        });

        return () => {
            socket.removeListener('receive-message');
            socket.removeListener('user-connected');
        };
    }, [roomId]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTo({
                top: messagesEndRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const sendMessage = () => {
        if (!isSending && inputMessage.trim() !== '') {
            setIsSending(true);
            const newMessage: Message = {
                text: inputMessage,
                sender: name ? name : 'sender',
                senderId: socket.id || '1',
                roomId: roomId,
                tx: null
            };
            socket.emit('send-message', { message: newMessage, roomId });
            setInputMessage('');
            setTimeout(() => {
                setIsSending(false);
            }, 500); // Пауза в полсекунды
        }
    };

    const sendMessageWithTxid = async () => {
        const txidRegex = /0x([A-Fa-f0-9]{64})/g;
        const matches = inputMessage.match(txidRegex);
        if (matches) {
            const txid = matches[0];
            try {
                const response = await fetch('http://localhost:3000/process-txid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ txid, message: inputMessage })
                });
                const data = await response.json();
                const newMessage: Message = {
                    text: inputMessage,
                    sender: name ? name : 'sender',
                    senderId: socket.id || '1',
                    roomId: roomId,
                    tx: data.txInfo
                };
                setInputMessage('');
                socket.emit('send-message', { message: newMessage, roomId });
                setTimeout(() => {
                    setIsSending(false);
                }, 500); // Пауза в полсекунды
            } catch (error) {
                console.error('Error processing txid:', error);
            }
        } else {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div style={{ color: "white", fontSize: "30px", letterSpacing: '3px' }}>Chat {roomId}</div>
            <div className="messages-container" ref={messagesEndRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message 
                ${message.senderId === socket.id ? 'me' : message.sender === 'System' ? 'system-message' : 'other'} 
                ${message.tx ? 'message_with_tx' : ''}`}
                    >
                        <div className={message.senderId === socket.id ? 'contMe' : 'contOther'}>
                            {message.sender !== 'System' && (
                                <div className="sender">{message.sender}</div>
                            )}
                            <div className="text">{message.text}</div>
                        </div>
                        {message.tx && (
                            <div className="tx-info">
                                <p className="tx">Amount: {message.tx.Amount}</p>
                                <p className="tx">From: {message.tx.WalletFrom}</p>
                                <p className="tx">To: {message.tx.WalletTo}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={inputMessage}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessageWithTxid();
                        }
                    }}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                    disabled={isSending}
                />
                <button
                    onClick={sendMessageWithTxid}
                    className="send-button"
                    disabled={isSending}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
};
