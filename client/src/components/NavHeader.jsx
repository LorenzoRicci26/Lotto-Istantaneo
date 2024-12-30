import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import '../App.css';

function NavHeader (props) {
  const [leaderboard_view, setLeaderBoardView] = useState(false);
  const nav = useNavigate();
  const handleNav = (name) =>{
    nav(name);
  }
  return (
    <Navbar className="navbar" variant="dark" expand="lg">
      {/* Brand + Play + Leaderboard */}
      <Navbar.Brand as={Link} to="/home" className="ms-3 d-flex align-items-center">
        <img src="/bingo (1).png" alt="Logo" className="me-2" style={{ width: '30px', height: '30px', color: 'white'}} />
          Lottery Game
      </Navbar.Brand>
      
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      <Navbar.Collapse id="basic-navbar-nav" className="d-flex justify-content-between align-items-center">
        {/* Left side with Play and Leaderboard */}
        <Nav className="me-auto d-flex align-items-center">
          {props.loggedIn && leaderboard_view && (<Nav.Link onClick={() => {
            handleNav("/game");
            setLeaderBoardView(false);
            }}>Play</Nav.Link>)}
          {props.loggedIn && !leaderboard_view && (<Nav.Link onClick={() => {
              handleNav("/leaderboard");
              setLeaderBoardView(true);
            }
            }>Leaderboard</Nav.Link>)}
        </Nav>

        {/* Right side with Username, Budget and Logout */}
        {props.loggedIn && (
          <Nav className="ms-auto d-flex align-items-center">
            <div className="navbar-user-info me-3">
              <span className="username">Logged as: {props.user.username}</span>
            </div>
            <div className="navbar-user-info me-3">
              <span className="budget">Budget: {props.user.budget} punti</span>
            </div>
            <Nav.Link onClick={props.logout} className="ms-3">Logout</Nav.Link>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavHeader;