import { resolve } from "path";
import db from "../db.mjs";
import crypto from "crypto";
import { rejects } from "assert";

export default function UserDao(){
    // Retrive the user by the specific username, mostly used for the Authentication
    this.getUser = (username, password) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM users WHERE username = ?"
            db.get(sql, [username], (err, row) => {
                if(err){
                    return reject(err);
                }else if (row === undefined){
                    return resolve(false);
                }else{
                    const user = {id: row.id, username: row.username, budget: row.budget};
                    // Genero l'hash crittografico
                    crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                        if(err) 
                            reject(err);
                        if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
                            return resolve(false);
                        else
                            return resolve(user);
                    });
                }
            });
        });
    }

    this.getUserById = (id) => {
      return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM users WHERE id = ?"
        db.get(sql, [id], (err, row) => {
          if(err){
            return reject(err);
          }else if(row === undefined){
            return reject(new Error("User Not Found"));
          }else{
            const user = {id: row.id, username: row.username, budget: row.budget};
            return resolve(user);
          }
        })
      })
    }

    // Retrive the leaderboard 
    this.getLeaderBoard = () => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT username, budget FROM users ORDER BY budget DESC LIMIT 3";
            db.all(sql, [], (err, rows) => {
                if(err){
                    return reject(err);
                }else if(rows === undefined){
                    return reject(new Error("Users Not Found"));
                }else{
                    let leaderBoard = [];
                    rows.forEach(row => {
                        const user = {id: row.id, username: row.username, budget: row.budget}
                        leaderBoard.push(user);
                    });
                    return resolve(leaderBoard); // Ritorno i 3 utenti con il budget + alto
                }
            });
        });
    }

    this.updateBudget = () => {
        return new Promise((resolve, reject) => {
          let get = "SELECT number, winning_numbers FROM lottery_draws WHERE number = (SELECT MAX(number) FROM lottery_draws)";
          
          db.get(get, [], (err, row) => {
            if (err) {
              return reject(err);
            } else if (!row) {
              return reject("Nessuna estrazione trovata.");
            }
            let all = "SELECT b.userId, u.budget, b.num1, b.num2, b.num3 FROM bets b, users u WHERE b.userId = u.id AND lotteryDraw_number = ?";
            db.all(all, [row.number], (err, rows) => {
              if (err) {
                return reject(err);
              } else if (!rows || rows.length === 0) {
                let update = "UPDATE lottery_draws SET state = 'FINAL' WHERE number = ?";
                    db.run(update, [row.number], (err) => {
                      if (err) {
                        return reject(err);
                      }
                      resolve(true);
                    });
              }
              rows.forEach((user, index) => {
                let new_budget = user.budget;
                let points_used = 0;
                let k = 0; // contatore dei numeri indovinati
                let points_won = 0;
                let winning_numbers = JSON.parse(row.winning_numbers);
      
                // Controllo numeri indovinati
                let numeriGiocati = [user.num1, user.num2, user.num3].filter(num => num !== undefined && num !== null);

                const n = numeriGiocati.length;

                points_used = n * 5;

                new_budget -= points_used;
                
                numeriGiocati.forEach(num => {
                  if (winning_numbers.includes(num)) {
                    k++;  
                  }
                });
      
                // Calcolo vincite
                if (k === n) {
                // Caso 1: Indovina tutti i numeri
                  points_won = 2 * points_used;
                  new_budget += points_won;
                } else if (k === 0) {
                  // Caso 2: Non indovina nessun numero
                  points_won = 0;
                } else {
                  // Caso 3: Indovina alcuni numeri
                  points_won = (k / n) * 2 * points_used; 
                  new_budget += points_won;
                }
      
                // Aggiorna il budget e lo stato dell'estrazione nel DB
                let sql2 = "UPDATE bets SET result = ? WHERE userId = ? AND lotteryDraw_number = ?";
                db.run(sql2, [points_won, user.userId, row.number], (err) => {
                  if (err) {
                    return reject(err);
                  }else{
                    let sql3 = "UPDATE users SET budget = ? WHERE id = ?";
                    db.run(sql3, [new_budget, user.userId], (err) => {
                      if (err) {
                        return reject(err);
                      }else{
                        let sql4 = "UPDATE lottery_draws SET state = 'FINAL' WHERE number = ?";
                        db.run(sql4, [row.number], (err) => {
                          if (err) {
                            return reject(err);
                          }
                          resolve(true);
                        });
                      }
                    });
                  }
                });
              });
            });
          });
        });
      };
}