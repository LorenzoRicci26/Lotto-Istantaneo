import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../API.mjs';

// Crea il contesto
export const GameContext = createContext();

export const GameProvider = ({ children, handleGameEnd, user, isLoggedOut }) => {

  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(''); 
  const [lottery_num, setLotteryNum] = useState('');
  const [draw_num, setDrawNum] = useState('');
  const [winning_numbers, setWinningNumbers] = useState('');
  const [points_won, setPointsWon] = useState('');
  const [show_result, setShowResult] = useState(false);
  const [isPolling, setPolling] = useState(false);
  const [betSubmitted, setBetSubmitted] = useState(false);
  const [numbers_played, setNumbersPlayed] = useState([]);

  // Funzione per sincronizzare il timer con il server
  const syncTimerWithServer = async () => {
    if(!isLoggedOut){
      try {
        const lottery = await API.getLottery();
        setLotteryNum(lottery.num);
        setTimeLeft(lottery.timer);
      } catch (err) {
        throw err;
      }
    }
  };

  useEffect(() => {
    syncTimerWithServer();
    const syncInterval = setInterval(() => {
      syncTimerWithServer();
    }, 10000); 

    return () => clearInterval(syncInterval);
  }, [isLoggedOut]);

  useEffect(() => {
    if (timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }

    if (timeLeft === 0) {
      setPolling(true);
    }
  }, [timeLeft]);

  const handleTimerEnd = async () => {
    try {
      if(!isLoggedOut){
        const result = await API.getResult(user.id);
        if (result.state === 'FINAL') {
          setPolling(false);
          setDrawNum(result.num);
          setWinningNumbers(result.winning_numbers);
          setPointsWon(result.points_won);
          setShowResult(true);
          setTimeLeft(result.timer);
          setNumbersPlayed(result.numbers_played);
          setSelectedNumbers([]);
          setBetSubmitted(false);
          handleGameEnd();
        }
      }
    } catch (err) {
      console.error("Errore durante il polling: ", err);
    }
  };

  useEffect(() => {
    if (isPolling) {
      const pollingInterval = setInterval(() => {
        handleTimerEnd();
      }, 1000);
      return () => clearInterval(pollingInterval);
    }
  }, [isPolling, isLoggedOut]);

  return (
    <GameContext.Provider value={{
      timeLeft,
      setTimeLeft,
      lottery_num,
      setLotteryNum,
      draw_num,
      winning_numbers,
      numbers_played,
      points_won,
      show_result,
      setShowResult,
      selectedNumbers,
      setSelectedNumbers,
      betSubmitted,
      setBetSubmitted,
    }}>
      {children}
    </GameContext.Provider>
  );
};
