// imports
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { check, body, validationResult} from 'express-validator';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

import UserDao from './dao/user_dao.mjs';
import BetDao from './dao/bet_dao.mjs';
import LotteryDrawDao from './dao/lotteryDraw_dao.mjs';

import Puntata from './Puntata.mjs';


// creo l'istanza dello userDao
const userDao = new UserDao();
const betDao = new BetDao();
const lotteryDrawDao = new LotteryDrawDao();

// inizializzo Timer e Array che conterrà i numeri vincenti di ogni round
let timerValue = 120;
let isUpdating = false;

// init express
const app = new express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('./public')); 

// set up and enable CORS 
const corsOptions = {
  origin: 'http://localhost:5173', // se qualcosa non ha questa origin dovrebbe smettere di funzionare
  optionsSuccessStatus: 200,
  credentials: true, // serve per scambiare i cookie, precisamente, serve al server per capire che può accetare i cookie anche da un'altra origine.
};
app.use(cors(corsOptions)); // middleware to enable CORS

// Authentication
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password);
  if (!user) 
    return cb(null, false, 'Incorrect username or password.'); // non diamo ulteriori aiuti ad un certo attaccante, non si specifica quale è errata.
  
  return cb(null, user);
})); 

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
      return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}
app.use(session({
  secret:"Ma te dormi là sotto al ponte?...Sotto al PONTOS?!? Ma stai scherzando io vivo nella estazionesssss",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session')); // aggiungo al server express l'oggetto passport costruito sopra, con la localStrategy e i metodi per serializzare e deserializzare.

/*ROUTES*/

/* GAME */

app.get('/api/lottery/result/:userId', isLoggedIn, async (req, res) => {
  try {
    const result = await lotteryDrawDao.getResult(req.params.userId);
    const numbers_played = [
      result.num1,
      result.num2,
      result.num3 
    ].filter(num => num !== undefined);

    const data = {
      num: result.num,  
      timer: timerValue,
      winning_numbers: result.numbers,
      state: result.state,
      points_won: result.points,
      numbers_played: numbers_played
    };
    res.status(200).json(data);
  }catch(err){
    if(err.message === "Lottery Draw Not Found"){
      res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/lottery/:num/:userId', isLoggedIn, async (req, res) => {
  try{
    const result = await betDao.getUserBet(req.params.userId, req.params.num);
    const numbers_played = [
      result.num1,
      result.num2,
      result.num3 
    ].filter(num => num !== undefined);
    res.status(200).json({numbers_played: numbers_played, isBet: result.isBet});
  }catch(err){
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/lottery', isLoggedIn, async (req, res) => {
  try{
    const lottery = await lotteryDrawDao.getLottery();
    const data = {
      num: lottery.num, 
      timer: timerValue, 
      state: lottery.state
    };
    res.status(200).json(data);
  }catch(err){
    if(err.message === "Lottery Draw Not Found"){
      res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/leaderBoard -> required the user logged in.
app.get('/api/lottery/leaderboard', isLoggedIn, async (req, res) => {
  userDao.getLeaderBoard()
  .then(leaderboard => {res.status(200).json(leaderboard)})
  .catch((err) => {
    if(err.message === "Users Not Found"){
      res.status(404).json({error: err.message});
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});

// POST /api/:username -> richiede che l'utente sia loggato.
app.post('/api/lottery/submit', 
  isLoggedIn, 
  [
    check('numbers')
      .isArray({ min: 1, max: 3 })  
      .withMessage('The numbers array must contain between 1 and 3 elements.')
      .custom((numbers) => {
        const uniqueNumbers = new Set(numbers);
        if(uniqueNumbers.size !== numbers.length){
          throw new Error('The numbers must be unique');
        }else{
          return true;
        }
      }),
    // Controlla che il primo elemento (index 0) sia presente e sia un numero intero
    body('numbers[0]')
      .exists().withMessage('The first number must be present.')
      .isInt().withMessage('The first number must be a valid integer.'),
  
    // Il secondo elemento (index 1) può essere opzionale, ma se presente deve essere un intero
    body('numbers[1]')
      .optional() 
      .isInt().withMessage('The second number must be a valid integer if provided.'),
  
    // Il terzo elemento (index 2) può essere opzionale, ma se presente deve essere un intero
    body('numbers[2]')
      .optional()  
      .isInt().withMessage('The third number must be a valid integer if provided.')
  ],

  (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const puntata = new Puntata(req.body.id, req.body.numbers[0], req.body.numbers[1], req.body.numbers[2]);
  betDao.InsertBet(puntata)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      if(err.message === "Lottery Draw not found" || err.message === "Insufficient budget to complete the bet"){
        res.status(404).json({ error: err.message });
      }else{
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
});

app.get('/api/lottery/:userId', isLoggedIn, async (req, res) => {
  userDao.getUserById(req.params.userId)
  .then((user) => {res.status(200).json(user)})
  .catch((err) => {
    if(err.message === "User Not Found"){
      res.status(404).json({error: err.message})
    }else{
      res.status(500).json({error: "Internal Server Error"})
    }
  })
})

/* Authentication API */

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()){
    res.status(200).json(req.user);
  }else{
    res.status(401).json({error: 'Not authenticated'});
  }
});

// POST /api/sessions
app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err)
      return next(err);
    if(!user){
      //display wrong login messages
      return res.status(401).send(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if(err){
        return next(err);
      }else{
        return res.status(201).json(req.user);
      }
    });
  })(req, res, next);
});

// DELETE /api/sessions/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/* FUNZIONI */

// Funzione per avviare il "thread" del timer ciclico
function startCyclicTimer() {
  setInterval(() => {
    if (timerValue > 0) {
      timerValue--; // Riduce il valore del timer di 1 ogni secondo
    } else { // Il timer è finito -> è il momento dell'estrazione.
      if(!isUpdating){
        isUpdating = true;
        const update = async () => {
          try{
            await lotteryDrawDao.insertWinningNumber(); 
            await userDao.updateBudget(); 
            timerValue = 120; // Reset del timer a 2 minuti
            await lotteryDrawDao.newLotteryDraw();
            isUpdating = false;
          }catch(err){
            throw err;
          }
        }
        update().catch(err => {
          isUpdating = false; // Reimposta il flag anche in caso di errore
        });
      }
    }
  }, 1000); // Aggiornamento ogni secondo
}

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  startCyclicTimer();
  lotteryDrawDao.newLotteryDraw();
});