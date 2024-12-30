import { useState } from "react";
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css'

function LoginForm(props){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = {username, password};
        props.login(credentials);
    }

    const handleCancel = (event) => {
      event.preventDefault();
      setUsername('');
      setPassword('');
    }

    return (
        <Row className="background-login">
          <Col md={6}>
            <Card className="p-4 rounded custom-font">
              <Card.Body>
                <Card.Title>
                  <h1><strong>Regole del Gioco</strong></h1>
                  </Card.Title>
                <Card.Text as ="div">
                  {/* Inserisci qui le regole del gioco */}
                  <ul className="mt-3">
                    <li><strong>Un'estrazione ogni 2 minuti</strong></li>
                    <li><strong>Puoi puntare un massimo di 3 numeri per estrazione</strong></li>
                    <li><strong>Puntare un numero costa 5 punti</strong></li>
                    <li><strong>Indovinare un numero fa guadagnare 10 punti</strong></li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <div className="form-overlay">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId='username' className='mb-3'>
                  <Form.Label>Username</Form.Label>
                  <Form.Control type='text' value={username} onChange={ev => setUsername(ev.target.value)} required={true} />
              </Form.Group>
    
              <Form.Group controlId='password' className='mb-3'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} required={true}/>
              </Form.Group>
    
              <Button type='submit' className="btn-orange">Login</Button>
              <Button className='btn btn-danger mx-2 my-2' onClick={handleCancel}>Cancel</Button>
          </Form>
          </div>
        </Col>
      </Row>
    )
}

function LogoutButton(props) {
    return(
      <Button variant='outline-light' onClick={()=>{props.logout(); navigate("/")}}>Logout</Button>
    )
  }
  
  export { LoginForm, LogoutButton };