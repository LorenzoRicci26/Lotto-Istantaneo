import db from "../db.mjs";

function generaNumeriLotto() {
    const numeriEstratti = new Set(); // Usa un Set per garantire l'unicità dei numeri
  
    while (numeriEstratti.size < 5) {
        const numero = Math.floor(Math.random() * 90) + 1; // Genera un numero tra 1 e 90
        numeriEstratti.add(numero); // Aggiungi il numero al Set (i duplicati sono ignorati)
    }
  
    return Array.from(numeriEstratti); // Converte il Set in un array
    
}

export default function LotteryDrawDao(){
    this.newLotteryDraw = () => {
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO lottery_draws(winning_numbers, state) VALUES(?, ?)";
            db.run(sql, [null, "CREATED"], (err) => {
                if(err){
                    return reject(err);
                }else{
                    return resolve(true);
                }
            })
        })
    }

    this.insertWinningNumber = () => {
        return new Promise((resolve, reject) => {
            let get = "SELECT MAX(number) as num FROM lottery_draws";
            db.get(get, [], (err, row) => {
                if(err){
                    return reject(err);
                }else{
                    const winning_numbers = generaNumeriLotto();
                    let update = "UPDATE lottery_draws SET winning_numbers = ?, state = ? WHERE number = ?";
                    db.run(update, [JSON.stringify(winning_numbers), "PROGRESS", row.num], (err) => {
                        if(err){
                            return reject(err);
                        }else{
                            return resolve(true);
                        }
                    });
                }
            }); 
        });
    }

    this.getLottery = () => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT number, winning_numbers, state FROM lottery_draws ORDER BY number DESC LIMIT 1";
            db.get(sql, [], (err, row) => {
                if (err) {
                    return reject(err);
                } else if (row === undefined) {
                    return reject(new Error("Lottery Draw Not Found"));
                } else {
                    return resolve(
                        {num: row.number, numbers: row.winning_numbers, state: row.state}
                    );
                }
            });
        });
    }

    this.getResult = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT number, winning_numbers, state FROM lottery_draws ORDER BY number DESC LIMIT 1 OFFSET 1";
            db.get(sql, [], (err, row) => {
                if (err) {
                    return reject(err);
                }else if (row === undefined){
                    return reject(new Error("Lottery Draw Not Found"));
                }else {
                    const sql1 = "SELECT b.result, b.num1, b.num2, b.num3 FROM bets b, users u WHERE b.userId = u.id AND b.userId = ? AND lotteryDraw_number = ?";
                    db.get(sql1, [userId, row.number], (err, res) => {
                        if(err){
                            return reject(err);
                        }else if (res === undefined){
                            return resolve({num: row.number, numbers: row.winning_numbers, state: row.state});
                        }else{
                            return resolve({
                                num: row.number, 
                                numbers: row.winning_numbers, 
                                state: row.state, 
                                points: res.result,
                                num1: res.num1,
                                num2: res.num2,
                                num3: res.num3
                            });
                        }
                    });
                }
            });
        })
    }
}