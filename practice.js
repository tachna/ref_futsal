app.post('/timesending', function(req, res){
    var mysql = require('mysql2');
    var db = mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '1234',
      database: 'putsaldb'
    });
})
    db.connect();

    db.query('SELECT serial FROM reservarion', function(error, results, fields) {
        console.log(results)
      })