import { useEffect, useState } from "react";
import { Row, Col, Container, Card, Badge } from "react-bootstrap";
import API from "../API.mjs";


function LeaderBoard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const users = await API.getLeaderBoard();
        // Ordina gli utenti in base al punteggio
        const sortedUsers = users.sort((a, b) => b.budget - a.budget);
        setUsers(sortedUsers);
      } catch (err) {
        throw err;
      }
    };
    getLeaderboard();
  }, []);

  return (
    <div className="nevio-filippo">
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="text-center">
        {/* Terzo posto */}
        {users[2] && (
          <Col xs={4} className="podium-third">
            <div className="podium-box">
              <Badge bg="secondary" className="podium-rank">3rd</Badge>
              <strong>{users[2].username}</strong>
              <div className="podium-score">{users[2].budget} pts</div>
            </div>
          </Col>
        )}

        {/* Primo posto */}
        {users[0] && (
          <Col xs={4} className="podium-first">
            <div className="podium-box">
              <Badge bg="primary" className="podium-rank">1st</Badge>
              <strong>{users[0].username}</strong>
              <div className="podium-score">{users[0].budget} pts</div>
            </div>
          </Col>
        )}

        {/* Secondo posto */}
        {users[1] && (
          <Col xs={4} className="podium-second">
            <div className="podium-box">
              <Badge bg="secondary" className="podium-rank">2nd</Badge>
              <strong>{users[1].username}</strong>
              <div className="podium-score">{users[1].budget} pts</div>
            </div>
          </Col>
        )}
      </Row>
    </Container>
    </div>
  );
}

export default LeaderBoard;
