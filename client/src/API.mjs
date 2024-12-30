const SERVER_URL = 'http://localhost:3001';

/* GAME */

const getResult = async (userId) => {
    const response = await fetch(SERVER_URL + `/api/lottery/result/${userId}`, { 
        credentials: 'include',
    });
    if(response.ok){
        const data = await response.json();
        return data;
    }else{
        const err = await response.text();
        return err;
    }
}

const getLottery= async () => {
    const response = await fetch(SERVER_URL + '/api/lottery', { 
        credentials: 'include',
    });
    if(response.ok){
        const data = await response.json();
        return data;
    }else{
        const err = await response.text();
        return err;
    }
}

const betSubmit = async (puntata) => {
    try{
        const response = await fetch(SERVER_URL + '/api/lottery/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(puntata),
        });
        if(response.ok){
            const data = await response.json();
            return data;
        }else{
            const err = await response.text();
            return err;
        }
    }catch(err){
        console.error('Errore durante l\'aggiornamento del budget:', err.message);
        throw err;
    }
}

const getLeaderBoard = async () =>{
    try{
        const response = await fetch(SERVER_URL + '/api/lottery/leaderboard', {
            credentials: 'include',
        });
        if(response.ok){
            const users = await response.json(); 
            return users;
        }else{
            const err = await response.text();
            return err;
        }
    }catch(err){
        console.error('Errore durante il recupero degli utenti con il punteggio più alto:', err.message);
        throw err;
    }
}

const getUser = async (id) => {
    const response = await fetch(SERVER_URL + `/api/lottery/${id}`, {
        credentials: 'include',
    });
    if(response.ok){
        const user = await response.json();
        return user;
    }else{
        const err = await response.text();
        throw err;
    }
}

const getUserBet = async (userId, num) => {
    const response = await fetch(SERVER_URL + `/api/lottery/${num}/${userId}`, {
        credentials: 'include'
    });
    if(response.ok){
        const result = await response.json();
        return result;
    }else{
        const err = await response.text();
        return err;
    }
}

/* API di AUTENTICAZIONE*/
const login = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if(response.ok){
        const user = await response.json();
        return user;
    }else{
        const err = await response.text();
        throw err;
    }
}

const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
        credentials: 'include',
    });
    const user = await response.json();
    if(response.ok){
        return user;
    }else{
        throw user;
    }
}

const logout = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
        method: 'DELETE',
        credentials: 'include',
    })
    if(response.ok){
        return null;
    }
}

const API = {login, getUserInfo, logout, getLottery, getUserBet, betSubmit, getLeaderBoard, getResult, getUser};

export default API;