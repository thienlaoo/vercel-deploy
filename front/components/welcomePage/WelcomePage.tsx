import './WelcomePage.scss';
import {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import io from 'socket.io-client';
export const WelcomePage = () => {
    const [createChat, setCreateChat] = useState('create');
    const [name, setName] = useState('');
    const [chatId, setChatId] = useState('');
    const [nameValid, setNameValid] = useState(true);
    const [chatIdValid, setChatIdValid] = useState(true);
    const [redirectToChat, setRedirectToChat] = useState(false);
    const navigate = useNavigate();
    const socket = io(); // Подключение к серверу без указания URL

    const handleClickCreate = () => {
        const isNameValid = name.trim() !== '';
        setNameValid(isNameValid);

        const isChatIdValid = /^\d+$/.test(chatId.trim());
        setChatIdValid(isChatIdValid);

        if (isNameValid && isChatIdValid) {
            setRedirectToChat(true);
        }
    };

    const handleClickJoin = () => {
        const isNameValid = name.trim() !== '';
        setNameValid(isNameValid);

        const isChatIdValid = /^\d+$/.test(chatId.trim());
        setChatIdValid(isChatIdValid);

        if (isNameValid && isChatIdValid) {
            setRedirectToChat(true);
        }
    };

    useEffect(() => {
        if (redirectToChat) {
            navigate(`/chat/${chatId}/${name}`);
        }
    }, [redirectToChat, navigate, chatId]);


    return (
        <div className="welcomePage">
            <div className="welcomePage_container">
                <p className="welcomePage_text">Hello! Please enter your name and chat ID to join the
                    chat...</p>

                <div className="form-floating mb-3">
                    <input
                        type="text"
                        className={`form-control ${!nameValid ? 'is-invalid' : ''}`}
                        id="floatingInput"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label htmlFor="floatingInput">Name</label>
                    {!nameValid && <div className="invalid-feedback">Invalid name</div>}
                </div>
                <div className="form-floating mb-3">
                    <input
                        type="text"
                        className={`form-control ${!chatIdValid ? 'is-invalid' : ''}`}
                        id="id"
                        placeholder="1"
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                    />
                    <label htmlFor="id">Chat ID</label>
                    {!chatIdValid && <div className="invalid-feedback">Invalid Chat ID</div>}
                </div>
                    <button type="button" className="btn btn-light" onClick={handleClickCreate}>
                        Connect
                    </button>
            </div>
        </div>
    );
};
