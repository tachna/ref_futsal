//express library 사용
const express = require('express');
const app = express();
const session = require('express-session');
app.use(express.urlencoded({extended: true})) //post요청을 위해
const FileStore = require('session-file-store')(session)
const mysql = require('mysql2'); //mysql 사용
app.set('view engine', 'ejs'); //ejs 사용 헤더
app.use('/public', express.static('public')) //미들웨어, public폴더를 사용 (css파일관련)
app.use(express.static('views')); //사진 
app.use('/uploads', express.static('uploads'));
require('dotenv').config()//env환경변수 선언
const methodOverride = require('method-override')// 메소드 오버라이드1
app.use(methodOverride('_method'))//메소드 오버라이드2
const bodyParser = require('body-parser');
////////////////////////////////////////////////////////
var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');
var template = require('./lib_login/template.js');

/////////////////////////////////////////////////////////
const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const transporter = nodemailer.createTransport({
  service: 'naver',
host: 'smtp.naver.com',  // SMTP 서버명
auth: {
  user: "jojongbum11@naver.com",  // 네이버 아이디
pass: "jk007456",  // 네이버 비밀번호
}
});
dotenv.config();

const { email_service, user, pass } = process.env;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'ABC',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore(),
}))

// var options = {
//     host : '127.0.0.1',
//     user : 'root',
//     password : '1234',
//     database : 'putsaldb'
// }
// //
// const connection = mysql.createConnection({
//     host : '127.0.0.1',
//     user:'root',
//     password:'1234',
//     database:'putsaldb',
//     port:'3306'
// });

// app.listen(3000,()=>{
//     connection.connect();
//     console.log('server is running port 3000!');
// });
app.get('/', function(req, res){
    res.render('user.ejs');
});
app.get('/login', (req, res) => {
    if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect('/auth/login');
      return false;
    } 
    else {                     
      var db = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '1234',
        database: 'putsaldb',
        multipleStatements: true
      });
      db.connect();
    
      db.query('SELECT (*) as A FROM reservarion WHERE wait=0',function(error,results,fields){   
                // 로그인 되어있으면 메인 페이지로 이동시킴
                console.log(results[0])
                res.render('admin.ejs',{'data': results})

          
    })
      }
  })

// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/admin', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  }
  //res.render('admin.ejs')
  // var html = template.HTML('Welcome',
  //    `<hr>
  //    `,
  // authCheck.statusUI(req, res)
  //  );
  //  res.send(html);
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb',
    multipleStatements: true
  });
  db.connect();

  db.query('SELECT count(*) as A FROM reservarion WHERE wait=0',function(error,results,fields){   
            // 로그인 되어있으면 메인 페이지로 이동시킴
            res.render('admin.ejs',{'data': results})

      
})
})
port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// app.get('/',function(req, res){
//     connection.query('select * from people',function(err, rows){
//         console.log(rows)
//         res.render('index.ejs',{'data':rows},function(err,html){
//             if(err){
//                 console.log(err)
//             }
//             res.end(html)
//         })
//     })
// })
app.get('/', function(req, res){
    res.render('user.ejs');
});
app.get('/list', function(req, res){
    res.render('login.ejs');
});

// app.get('/login', function(req, res){
//     res.render('charts.ejs');
// });
app.get('/register', function(req, res){
    res.render('register.ejs');
});
app.get('/cards', function(req, res){
    res.render('cards.ejs');
});

app.get('/checking',function(req,res){
    res.render('check.ejs')
})
function mailing() {

}
app.get('/cancel/:id',function(req,res){
  var serial = parseInt(req.params.id)
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb',
    multipleStatements: true
  });
  db.connect();

  db.query('SELECT * FROM reservarion WHERE serial=?',[serial],function(error,results,fields){
      if (error) {
        console.error(error);
      } 
      else {
        const mailOptions = {
          from : "jojongbum11@naver.com",
          to: results[0].email,
          subject: '[부산대 풋살 관리시스템]',
          text: '예약이 취소 되었습니다!'
          };
        transporter.sendMail(mailOptions, (error, info) => {
          console.log('Email Sent : ', info);
          db.query('DELETE FROM reservarion WHERE serial=?',[serial],function(error,results,fields){
            if (error) throw error;
            res.send(
            `<script>
            alert('취소가 완료되었습니다!.');
            history.go(-1);
            </script>`
            );
        })
        })
      
    }
  })
})



app.get('/allow/:id',function(req,res){

  var serial = parseInt(req.params.id)
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb',
    multipleStatements: true
  });
  db.connect();

  db.query('SELECT * FROM reservarion WHERE serial=?',[serial],function(error,results,fields){

    var input_data = [serial];
    email = results[0].email
    var sql= "UPDATE reservarion SET wait = 1  WHERE serial=?;";

    const mailOptions = {
      from : "jojongbum11@naver.com",
      to: email,
      subject: '[부산대 풋살 관리시스템]',
      text: '예약 승인 되었습니다!'
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email Sent : ', info);
         db.query(sql,input_data,function(error,results,fields){
          if (error) throw error;
          else{
           
            res.send(
              `<script>
              alert('승인이 완료되었습니다!.');
              history.go(-1);
              </script>`
              ); 
          
            }
        })
      }
    })

  })
  
  // db.query('UPDATE reservarion SET wait = 0  WHERE serial=?',[serial],function(error,results,fields){
  //   if (error) throw error;
  //   res.send(
  //     `<script>
  //       alert('승인이 완료되었습니다!.');
  //       history.go(-1);
  //     </script>`
  //   ); 
  // })
})
app.get('/record',function(req,res){
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb'
  });
  db.connect();

  db.query('SELECT * FROM RESERVARION_REPOSI',function(error,results,fields){
    if (error) throw error;
    if(results.length>0){
      
      res.render('record.ejs',{'data': results})
    }
    else {
      ;   res.send(
            `<script>
              alert('기록이 없습니다.');
              history.go(-1);
            </script>`
          ); 
        };
  })
})
app.get('/allow_list',function(req,res){
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb'
  });
  db.connect();

  db.query('SELECT * FROM RESERVARION WHERE wait=0',function(error,results,fields){
    if (error) throw error;
    if(results.length>0){
      
      res.render('allow_list.ejs',{'data': results})
    }
    else {
      ;   res.send(
            `<script>
              alert('대기중인 예약건이 없습니다.');
              history.go(-1);
            </script>`
          ); 
        };
  })
})
app.get('/complete_list',function(req,res){
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb'
  });
  db.connect();

  db.query('SELECT * FROM RESERVARION WHERE wait=1',function(error,results,fields){
    if (error) throw error;
    if(results.length>0){
      
      res.render('complete_list.ejs',{'data': results})
    }
    else {
      ;   res.send(
            `<script>
              alert('승인완료된 예약건이 없습니다.');
              history.go(-1);
            </script>`
          ); 
        };
  })
})
app.post('/checking_send',function(req,res){
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb'
  });
  db.connect();
  var id=req.body.id
  db.query('SELECT * FROM reservarion WHERE email=?;',[id], function(error, results, fields) {
    if (error) throw error;
    if(results.length>0){
      console.log(results)
      console.log(results[0].email)
      if(results[0].level==1){results[0].level='6~8 시'}
      else if(results[0].level==2){results[0].level='8~10 시'}
      else if(results[0].level==3){results[0].level='10~12 시'}
      else if(results[0].level==4){results[0].level='12~14 시'}
      else if(results[0].level==5){results[0].level='14~16 시'}
      else if(results[0].level==6){results[0].level='16~18 시'}
      else if(results[0].level==7){results[0].level='18~20 시'}
      else if(results[0].level==8){results[0].level='20~22 시'}
      else if(results[0].level==9){results[0].level='22~24 시'}
      if(results[0].wait==0){results[0].wait='승인 대기중'}
      else if(results[0].wait==1){results[0].wait='승인 완료'}
      res.render('checkinguser.ejs',{'data': results})
    }
    else {
;        res.send(
          `<script>
            alert('존재하지않는 이메일입니다.');
            history.go(-1);
          </script>`
        ); 
      };
    })
    db.end();
  })

//로긴 페이지 셋팅 -----------------------------------------------------------------------------------------------
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(session({secret:'비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());
//
// app.get('/login',function(req, res){
//     res.render('login.ejs')
// });

// app.get('/list',function(req, res){
  
//     connection.query('select * from board',function(err, rows){
//         var queryString = "SELECT * FROM people"
//         connection.query(queryString,(err,rows,fields)=>{
//             res.json(rows)
//         })
//     })
//   })
  
  // app.get('/loginlistview',function(req, res){
    
  //   connection.query('select * from board',function(err, rows){
  //     console.log(rows)
  //     res.render('login-notice_list.ejs', {'data' : rows}, function(err ,html){
  //       if (err){
  //           console.log(err)
  //       }
  //       res.end(html) // 응답 종료
  //     })
  //   })
  // })    
  


//------------------------------------------------------------------------




var randomNo

app.post('/email_send', function(req, res){
  
  randomNo = Math.floor(Math.random() * 89999) + 10000;
  const mailOptions = {
    from : "jojongbum11@naver.com",
    to: req.body.id,
    subject: '[부산대 풋살 관리시스템]',
    text: '인증번호를 입력해주세요'+'['+randomNo+']'
  };
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb'
  });
  db.connect();
  var user_mail = req.body.id

  // var today = new Date();
  // var year = today.getFullYear();
  // var month = ('0' + (today.getMonth() + 1)).slice(-2);
  // var day = ('0' + today.getDate()).slice(-2);
  // var dateString = year + '-' + month  + '-' + day;
  // console.log(dateString)
    var today = new Date();
  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);
  var dateString = year + '-' + month  + '-' + day;
  var test = new Date('2023-07-10')
  console.log('test day : '+test)
  console.log(dateString)
  console.log(typeof(dateString))
  var sql= "select * from reservarion where email=?;";
  var input_data = [user_mail];
  db.query(sql,input_data, function(error, results, fields) {


    if (results.length>0){
      console.log(results[0].date)
      console.log(typeof(results[0].date))
      // console.log(error)
      if(new Date(dateString)>new Date(results[0].date)){
        console.log('over time')
        db.query('delete from reservarion where email=?',user_mail, function(error, results, fields) {
          transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log('Email Sent : ', info);
          }
        })
        })
      }
      else{
        res.send(
          `<script>
            alert('이미 예약 대기건이 존재합니다');
            history.go(-1);
          </script>`
        ); 
      }
    }
    else{
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email Sent : ', info);
        }
      })

    }
  })

});

app.post('/code_send', function(req, res){
  if(req.body.code==randomNo){
    res.render('user2.ejs');
  }
  else{
    res.send(
      `<script>
        alert('인증번호가 일치하지 않습니다!');
        history.go(-1);
      </script>`
    ); 
  }

});


app.post('/timesending', function(req, res){
  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb',
    multipleStatements: true
  });
  db.connect();
  var date = req.body.date
  var time = parseInt(req.body.val) 
  var name = req.body.name;
  var email = req.body.email;
  var wait = 0;
  var stu_num = req.body.stu_num;
  var major = req.body.major
  var members = req.body.members
  var reason = req.body.reason
  var email = req.body.mail
  var today = new Date();
  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);
  var dateString = year + '-' + month  + '-' + day;
  console.log(dateString)
  var wait2 = 3
  var input_data = [time, name,date,wait,stu_num,major,members,reason,email,dateString];
  var input_data2 = [time, name,date,wait2,stu_num,major,members,reason,email,dateString];
  var sql= "insert into reservarion(level, name,date,wait,stu_num,major,members,reason,email,r_date) values(? ,? ,?,?,?,?,?,?,?,?);";
  var sql1s = mysql.format(sql, input_data); 
  var sql2= "insert into reservarion_reposi(level, name,date,wait,stu_num,major,members,reason,email,r_date) values(? ,? ,?,?,?,?,?,?,?,?);";
  var sql2s = mysql.format(sql2, input_data2); 


  db.query('SELECT * FROM reservarion WHERE level=? AND date=?;',[time,date], function(error, results, fields) {
    if (error) { res.send(
      `<script>
          alert('필수값이 누락되었습니다. 다시 해주십시오');
          history.go(-1);
        </script>`
    ); }
    if(results.length>0){
      res.send(
        `<script>
          alert('해당 시간은 이미 예약되어있습니다(다른시간대를 선택해주세요))');
          history.go(-1);
        </script>`
      ); 
    }
    else {
      db.query(sql1s+sql2s, input_data, function(error) {
        if (error) throw error;
        res.send(
          `<script>
            alert('해당 시간에 예약이 완료되었습니다!!');
            history.go(-3);
          </script>`
        ); 
        
      });
    }
    db.end();
  })
  
});





// app.get('/pra', function(req, res){
//   var db = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '1234',
//     database: 'putsaldb'
//   });
//   db.connect();
  
//   db.query('SELECT level,date FROM reservarion;', function(error, results, fields) {
//     if (error) throw error;
//     var time = parseInt(req.body.val) 
//     for (var i =0;i<results.length;i++){
//       console.log(results[i].level)
//       console.log(time)
//       console.log(results[i].date)
//       console.log(req.body.date)
//       if(results[i].level==time&&results[i].date==req.body.date){

//         res.send(
//           `<script>
//             alert('해당 시간은 이미 예약되어있습니다(다른시간대를 선택해주세요))');
//             history.go(-1);
//           </script>`
//         ); 
//       }
//     }
//     res.send(
//       `<script>
//         alert('hi');
//         history.go(-1);
//       </script>`
//     ); 

//   })
//   db.end();
// });
// app.post('/timesending', function(req, res){
//   var db = require('./lib_login/db');
//   if(req.body.code==randomNo){
//     res.render('user2.ejs');
//   }
//   else{
//     res.send(
//       `<script>
//         alert('인증번호가 일치하지 않습니다!');
//         history.go(-1);
//       </script>`
//     ); 
//   }

// });


//------------------------------------------------------------------------
//localstrategy인증방식
// passport.use(new LocalStrategy({ 
//     usernameField: 'id',
//     passwordField: 'pw',
//     session: true,
//     passReqToCallback: false,
//  }, function(입력한아이디, 입력한비번, done) {
//     console.log(입력한아이디, 입력한비번);
//     db.collection('login').findOne({ id: 입력한아이디 }, function(에러, 결과) {
//          if (에러) return done(에러) 
//          if (!결과) return done(null, false, { message: '존재하지않는 아이디요' }) 
//          if (입력한비번 == 결과.pw) {
//             return done(null, 결과)
//         } else {
//             return done(null, false, { message: '비번틀렸어요' })
//         }
//     })
// }));

// 세션유지 main
// // 세션을 저장시키는 코드(로그인 성공시 발동)
// passport.serializeUser(function(user, done){
//     done(null, user.id)
// });

// app.get('/logout', function(req,res){
//     req.logout();
//   res.clearCookie('connect.sid');
//   res.redirect('/');
//   });
  
// //이 세션 데이터를 가진 사람을 db에서 찾아주세요 (마이페이지 접속시 발동)
// passport.deserializeUser(function(아이디, done){
//     db.collection('login').findOne({ id : 아이디}, function(에러, 결과){
//         done(null, 결과)
//     })
// });


//---------------------------------------------------------------------------------------------------------------


app.get('/practi',function(req,res){


  var mysql = require('mysql2');
  var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'putsaldb',
    multipleStatements: true
  });
  db.connect();
  sql = 'SELECT * FROM reservarion WHERE level=? AND date=?;'
  input_data = []
  db.query(sql, input_data, function(error) {
    data = '삽입 데이터'
    const mailOptions = {
      from : "jojongbum11@naver.com",
      to: "jo8020173@gmail.com",
      subject: '[부산대 풋살 관리시스템]',
      text: '예약 승인 되었습니다!',
      // attachments: [{'filename':'test.xlsx','content':data}],
      attachments: [{filename:'test.txt',
                      path:'test.txt'                  
      }]
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email Sent : ', info);
          db.query('UPDATE reservarion SET wait = 1  WHERE serial=?',[serial],function(error,results,fields){
            if (error) throw error;
            res.send(
            `<script>
            alert('승인이 완료되었습니다!.');
            history.go(-1);
            </script>`
            ); 
          })
        }
      })

    })
  }
)