const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

const db = new sqlite3.Database('./mydatabase.db', (err) =>{
   if(err){
      console.error('Error opening database', err.message);
   } else{
      console.log('Connected to database');
   }
});

db.run(`CREATE TABLE IF NOT EXISTS
   users(id INTEGER PRIMARY KEY AUTOINCREMENT, 
   name TEXT, 
   date TEXT
   );`);


//----------> Returns a list of items from the database.
app.get('/users', (req, res) => {
   db.all('SELECT * FROM users', [], (err, rows) =>{
      if(err){
         return res.status(500).send({error: err.message});
      } else{
         res.json(rows);
      }
   })
});


//----------> Adds new users to the database.
app.post('/users', (req, res) =>{
   const {name, date} = req.body;
   const statement = db.prepare('INSERT INTO users (name, date) VALUES (?, ?)');
   statement.run([name, date], function(err) {
      if(err){
         res.status(500).send({error: err.message});
      }
      res.status(201).json({id: this.lastID, name, date});
   });
   statement.finalize();
});


//----------> Update an existing item based on its ID.
app.put('/users/:id', (req, res) =>{
   const {id} = req.params;
   const {name, date} = req.body;

   const statement = db.prepare('UPDATE users SET name = ?, date = ? WHERE id = ?');
   statement.run([name, date, id], function(err){
      if(err){
         return res.status(500).send({error: err.message});
      }
      if(this.changes === 0){
         return res.status(404).send({error: 'User not found'});
      }
      res.status(200).json({id, name, date})
   })
});


//----------> Partially update an existing user based on its ID.
app.patch('/users/:id', (req, res) => {
   const {id} = req.params;
   const {name, date} = req.body;

   const fields = [];
   const values = [];
   if (name) {
      fields.push('name = ?');
      values.push(name);
   }
   if (date) {
      fields.push('date = ?');
      values.push(date);
   }
   values.push(id);

   const statement = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
   statement.run(values, function(err) {
      if (err) {
         return res.status(500).send({error: err.message});
      }
      if (this.changes === 0) {
         return res.status(404).send({error: 'User not found'});
      }
      res.status(200).json({id, name, date});
   });
   statement.finalize();
});


//Detect user based on its ID
app.delete('/users/:id', (req, res) => {
   const {id} = req.params;

   const statement = db.prepare('DELETE FROM users WHERE id = ?');
   statement.run([id], function(err) {
      if (err) {
         return res.status(500).send({error: err.message});
      }
      if (this.changes === 0) {
         return res.status(404).send({error: 'User not found'});
      }
      res.status(204).send();  // No content to return
   });
   statement.finalize();
});

app.listen(port, () =>{
console.log(`listening on http://localhost:${port}`);
});