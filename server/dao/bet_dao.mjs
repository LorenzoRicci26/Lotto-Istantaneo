import db from "../db.mjs";
import UserDao from "./user_dao.mjs";

export default function BetDao(){
    this.InsertBet = (puntata) => {
        return new Promise((resolve, reject) => {
            let get1 = "SELECT MAX(number) as id FROM lottery_draws";
            db.get(get1, [], (err, row) => {
                if(err){
                    return reject(err);
                }else if(row === undefined){
                    return reject(new Error("Lottery Draw Not Found"));
                }else{
                    let budget_needed = 0;
                    let get2 = "SELECT budget FROM users WHERE id = ?";
                    db.get(get2, [puntata.userId], (err, user) => {
                        if(err){
                            return reject(err);
                        }else if(user === undefined){
                            return reject(new Error("User Not Found"));
                        }else{
                            if(puntata.num1 !== undefined){
                                budget_needed += 5;
                            }
                            if(puntata.num2 !== undefined){
                                budget_needed += 5;
                            }
                            if(puntata.num3 !== undefined){
                                budget_needed += 5;
                            }
                            if(budget_needed > user.budget){
                                return reject(new Error("Insufficient budget to complete the bet"))
                            }
                            let insert = "INSERT INTO bets(userId, lotteryDraw_number, num1, num2, num3, result) VALUES(?, ?, ?, ?, ?, ?)";
                            db.run(insert, [puntata.userId, row.id, puntata.num1, puntata.num2, puntata.num3, null], (err) => {
                                if(err){
                                    return reject(err);
                                }else{
                                    return resolve(true);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    this.getUserBet = (userId, lottery_num) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT num1, num2, num3 FROM bets WHERE userId = ? AND lotteryDraw_number = ?";
            db.get(sql, [userId, lottery_num], (err, row) => {
                if(err){
                    return reject(err);
                }else if(row === undefined){
                    return resolve({isBet: false});
                }else{
                    return resolve({num1: row.num1, num2: row.num2, num3: row.num3, isBet: true});
                }
            })
        })
    }
}