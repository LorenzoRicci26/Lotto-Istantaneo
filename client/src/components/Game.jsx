import React, {useContext, useEffect, useState} from 'react';
import { Button, ProgressBar, Container, Row, Col, Modal} from 'react-bootstrap';
import API from '../API.mjs';
import '../App.css';
import { GameContext } from './GameContext';

function Game(props) {
  const {
    timeLeft,
    setTimeLeft,
    lottery_num,
    setLotteryNum,
    selectedNumbers,
    setSelectedNumbers,
    show_result,
    setShowResult,
    points_won,
    draw_num,
    winning_numbers,
    numbers_played,
    betSubmitted,
    setBetSubmitted,
  } = useContext(GameContext); 

  useEffect(() => {
    const fetchLottery = async () => {
      try{
        const lottery = await API.getLottery();
        setTimeLeft(lottery.timer);
        setLotteryNum(lottery.num);
        const bet = await API.getUserBet(props.user.id, lottery.num);
        if(bet.isBet){
          setBetSubmitted(true);
          setSelectedNumbers(bet.numbers_played);
        }else{
          setBetSubmitted(false);
          setSelectedNumbers([]);
        }
      }catch(err){
        throw err;
      }
    }
    fetchLottery();
  }, [show_result]);

    // Funzione per gestire il click sulle LotteryBalls
    const handleClick = (number) => {
      setSelectedNumbers((prevSelectedNumbers) => {
        if (prevSelectedNumbers.includes(number)) {
          return prevSelectedNumbers.filter((n) => n !== number);
        } 
        else if (prevSelectedNumbers.length < 3) {
          return [...prevSelectedNumbers, number];
        }else{
          return prevSelectedNumbers;
        }
      });
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      try{
        if(selectedNumbers.length !== 0 && (selectedNumbers.length * 5) <= props.user.budget){
          setBetSubmitted(true);
          const userId = props.user.id;
          const puntata = {id: userId, numbers: selectedNumbers};
          await API.betSubmit(puntata);
        }else if(selectedNumbers.length === 0){
          props.setMessage({msg: 'Per compiere una puntata hai bisogno di selezionare almeno un numero!', type: 'warning'});
        }else{
          props.setMessage({msg: 'Non hai punti a sufficienza per compiere la puntata!', type: 'danger'});
          setSelectedNumbers([]);
        }
      }catch(err){
        throw err;
      }
    }

    return (
        <div className="background-lottery-game mb-3">
          <Row className="d-flex justify-content-center align-items-center mb-1 ">
            <Col xs="auto" className='mt-2'>
              <h2 className='lottery-title'>Estrazione N° {lottery_num}</h2>
            </Col>
          </Row>
          <TimeProgress time={timeLeft}/>
          {!betSubmitted ? <>
          <Row className="justify-content-center mb-1">
            <LotteryBalls click={handleClick} selectedNumbers={selectedNumbers}/>
          </Row>
          <Row className="d-flex justify-content-center">
            <Button 
              type="button" // Imposta il tipo come button per evitare submit predefiniti
              className="submit-button" 
              onClick={handleSubmit} 
            >
              Submit
            </Button>
          </Row></> 
          : 
          <Row className="d-flex justify-content-center align-items-center mb-1 ">
            <Col xs="auto" className='mt-2'>
              <div className="centered-content row-background">
                <h1 className="lottery-betSubmitted1">La tua puntata è stata registrata con successo!</h1>
                <p className='lottery-betSubmitted2'>Numeri Puntati:</p>
                <div className="selected-numbers">
                  {selectedNumbers.map((number, index) => (
                    <span key={index} className="number">{number}</span>
                  ))}
                </div>
              </div>
            </Col>
          </Row>}
          <Result 
            onHide={() => setShowResult(false)} 
            show={show_result} 
            lottery_num={draw_num} 
            winning_numbers={winning_numbers} 
            numbers_played={numbers_played}
            points={points_won}
          />
        </div>
      );
}

function LotteryBalls(props){
  return (
    <div className='d-flex justify-content-center'>
      {/* Griglia di 9 righe per 10 colonne */}
      <Row className="d-flex justify-content-center align-items-center">
        <Col xs="auto">
        {Array.from({ length: 9 }).map((_, rowIndex) => (
        <Row key={rowIndex} className="mb-3 d-flex justify-content-center">
          {/* Cicla per creare 10 colonne in ogni riga */}
          {Array.from({ length: 10 }).map((_, colIndex) => {
            const number = rowIndex * 10 + colIndex + 1; // Calcola il numero del bottone da 1 a 90
            const isSelected = props.selectedNumbers.includes(number);
            return (
              <Col key={colIndex} xs={2} md={1} className="text-center">
                <div
                  className={`lottery-ball ${isSelected ? 'active' : ''}`}
                  onClick={() => props.click(number)}
                >
                  {number}
                </div>
              </Col>
            );
          })}
        </Row>
      ))}
        </Col>
      </Row>
    </div>
  );
}

function TimeProgress(props) {
  const getVariant = (time) => {
    if (time > 45) {
      return 'success'; 
    } else if (time > 10) {
      return 'warning'; 
    } else {
      return 'danger'; 
    }
  }

  return (
    <div>
      <ProgressBar
        variant={getVariant(props.time)}
        now={props.time}
        label={formatTime(props.time)}
        className="custom-progress-bar mb-3"
      />
    </div>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0
    ? `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} min`
    : `${seconds} s`;
}

function Result(props) {
  const numbersPlayed = props.numbers_played.filter(num => num !== null).join(', ');

  return (
    <div className='background-modal'>
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static" // Non permette di chiudere cliccando fuori dal modal
      show={props.show} // Mostra il modal solo se `props.show` è true
      onHide={props.onHide} // Gestisce la chiusura dal pulsante
      
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Risultato estrazione n° {props.lottery_num}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Numeri vincenti</h4>
        <span style={{ fontWeight: 'bold', color: 'red', fontSize: '1.2rem' }}>
          {props.winning_numbers.split(',').join(', ')}
        </span>
      </Modal.Body>
      <Modal.Body>
      {numbersPlayed.length !== 0
        ? (
          <>
            <h4>Numeri giocati</h4>
              <span style={{ fontWeight: 'bold', color: 'red', fontSize: '1.2rem' }}>
                I numeri che hai giocato sono: {numbersPlayed}
              </span>
          </>
        ) : 
          <>
            <h4>Non è stata trovata nessuna puntata!</h4>
          </>}

      </Modal.Body>
      <Modal.Body>
        {numbersPlayed.length !== 0
        ? (
          <>
            <h4>Risultato delle tue puntate</h4>
              <span style={{ fontWeight: 'bold', color: 'red', fontSize: '1.2rem' }}>
                Punti guadagnati: {props.points ? props.points : 0}
              </span>
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Chiudi</Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
}

export default Game