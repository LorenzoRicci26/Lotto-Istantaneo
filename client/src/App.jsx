import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect} from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import NavHeader from './components/NavHeader';
import { LoginForm } from './components/AuthComponents';
import NotFound from './components/NotFoundComponent';
import API from './API.mjs';
import Game from './components/Game';
import Home from './components/Home';
import LeaderBoard from './components/LeaderBoard';
import { GameProvider } from './components/GameContext';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedOut, setLoggedOut] = useState(true);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');
  const nav = useNavigate();

  // Metodi per gestire login e logout
  const handleLogin = async (credentials) => {
    try{
      const user = await API.login(credentials);
      setLoggedIn(true);
      setLoggedOut(false);
      setUser(user);
    }catch(err){
      setMessage({msg: err, type: 'danger'});
    }
  }

  const handleLogout = async () => {
    try{
      await API.logout();
      setLoggedIn(false);
      setLoggedOut(true);
      setMessage('');
      setUser('');
      nav("login");
    }catch(err){
      throw err;
    }
  }

  const handleGameEnd = async () => {
    try{
      const updated_user = await API.getUser(user.id);
      setUser(updated_user);
    }catch(err){
      throw err;
    }
  }

  // authenticated route navigation component
  return (
    <GameProvider handleGameEnd={handleGameEnd} user={user} isLoggedOut={loggedOut}>
      <Routes>
        <Route path="/" element={
          <>
            <NavHeader loggedIn={loggedIn} logout={handleLogout} user={user}/>
            <div>
              {message && (
                <Row>
                  <Alert className="text-center" variant={message.type} onClose={() => setMessage('')} dismissible>
                    {message.msg}
                  </Alert>
                </Row>
              )}
              <Outlet />
            </div>
          </>
        }>
          {/* Default redirect to /home if not logged in */}
          <Route index element={<Navigate replace to="/home" />}/>

          {/* Route per la Home (pagina iniziale) */}
          <Route path="/home" element={<Home />}/>

          {/* Route per la fase di login */}
          <Route element={!loggedIn ? <Navigate replace to="/login" /> : null} /> 
          <Route path="/login" element={
            loggedIn ? <Navigate replace to="/game" /> : <LoginForm login={handleLogin} />
          } />
        
          {/* Route per il game */}
          <Route path='/game' element={!loggedIn ? <Navigate replace to="/login" /> : <Game user={user} message={message} setMessage={setMessage} handleGame={handleGameEnd}/>}/>
          <Route path='/leaderboard' element={!loggedIn ? <Navigate replace to="/login" /> : <LeaderBoard />}/>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ GameProvider>
  );
}

export default App
