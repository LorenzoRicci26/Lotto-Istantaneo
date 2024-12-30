import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../App.css';  // Assicurati che il file CSS aggiornato sia importato

function Home() {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate('/login');
  };

  return (
    <Container fluid className="background-container" >
      <Row>
        <Col className='text-center'>
          <h1 className='highlighted-text'><strong>Benvenuto nel Lotto Istantaneo!</strong></h1>
          <p className='highlighted-text'>Sei pronto a giocare? Clicca il pulsante qui sotto per iniziare.</p>
          <Button variant="primary" onClick={handlePlayClick}>Gioca</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;

