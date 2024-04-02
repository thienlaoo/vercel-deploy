import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WelcomePage } from "../components/welcomePage/WelcomePage.tsx";
import { Chat } from "../components/Chat/Chat.tsx";
import './App.scss';

const App = () => {
    return (
        <div className="app">
            <Router>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/chat/:roomId/:name" element={<Chat />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;
