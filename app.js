const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const ejs = require('ejs');
//------------------------------
const hostname = 'localhost';
const port = 3000;

const max_num = 10;
const filename = 'mydata.txt';
var message_data;
readFormFile(filename);

//同期
const index_page = fs.readFileSync('./index.ejs','UTF-8');
const login_page = fs.readFileSync('./login.ejs','UTF-8');
const style_css = fs.readFileSync('./style.css','UTF-8');

var server = http.createServer(getFromCliant);
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

//------------------------------------------------------------
// コントローラー
//------------------------------------------------------------
function getFromCliant (req,res){
	var url_parts = url.parse(req.url,true);//true をつけるとパラメータもパースされて扱いやすい
	switch(url_parts.pathname){
		case '/':
			console.log('■■ index:'+url_parts.pathname);
			indeX_render(req,res,url_parts);
			break;
		case '/login':
			console.log('■■ other:'+url_parts.pathname);
			login_render(req,res);
			break;
		case '/style.css':
			console.log('■■ style:'+url_parts.pathname);
			res.writeHead(200, {"Content-Type": "text/css"});
			res.write(style_css);
			res.end();
			break;
		default:
			console.log('■etc:'+url_parts.pathname);
			res.writeHead(200,{'Content-Type':'text/plain'});
			res.end('no page................');
			break;
	}
}

//------------------------------------------------------------
//画面ごとの処理
//------------------------------------------------------------
//TOPページ
function indeX_render(req,res,url_parts){
	//POST
	if(req.method == 'POST'){
		var body ='';
		//データ受信のイベント処理
		req.on('data', function(chunk) {
			body += chunk;
			console.log('■データ受信のイベント処理 :'+chunk+ '受信→に追記'+body);
		});
		//データ受信終了のイベント処理
		req.on('end', function() {
			var postdata = querystring.parse(body);
			addToData(postdata.id,postdata.msg,filename,req);
			console.log('1　■　■　■　■　■　■　■　■　■　■　■　■　■　■');
			var msg ='※伝言を表示します';
			var content = ejs.render(index_page,{
				title:'indexタイトル',
				content:msg,
				data:message_data,
				filename:'table_data'
			});
			console.log('2　■　■　■　■　■　■　■　■　■　■　■　■　■　■');
			write(res,content);
		});
	//GET
	} else {
		//既にロード済のページにレンだー
		var content = ejs.render(login_page,{
			title:'GETで遷移',
			msg:'GET!'
		});
		write(res,content);
	}
}

//POST確認画面
function login_render(req,res){
	var content = ejs.render(login_page,{
		title:'POSTで遷移',
		msg:'POST!login_render'
	});
	write(res,content);
}
//-----------------------------------

function readFormFile(fname){
	fs.readFile(fname,'utf-8',function(err,data){
		message_data = data.split('\n');
	});
}

//追加
function addToData(id,msg,Fname,req) {
	console.log('addToData');
	var obj = {'id':id,'msg':msg};
	var obj_string = JSON.stringify(obj);
	message_data.unshift(obj_string);
	console.log('3'+message_data);
	console.log('3　■　■　■　■　■　■　■　■　■　■　■　■　■　■');
	console.log('3'+message_data.length);
	if(message_data.length > max_num){
		message_data.pop();//最後の行を削除
	}
	console.log('4　■　■　■　■　■　■　■　■　■　■　■　■　■　■');
	saveToFile(Fname);
	console.log('5　■　■　■　■　■　■　■　■　■　■　■　■　■　■');
}

//保存
function saveToFile(Fname){
	var data_str = message_data.join('\n');
	fs.writeFile(Fname,data_str,function(err){
		if(err){throw err;}
	})
}

function write(res,content){
	console.log('6　■　■　■　■　■　■　■　■　■　■　■　■　■　■');
	res.writeHead(200,{'Content-Type':'text/html'});
	res.write(content);
	res.end();
}

function write_index(req,res){
	var msg ='※伝言を表示します';
	var content = ejs.render(index_page,{
		title:'indexタイトル',
		content:msg,
		data:message_data	,
		filename:'table_data'
	});
	write(res,content);
}



// function setCookie(key ,val ,res){
// 	var cookie = escape(val);
// 	console.log('■ setCookie val:'+val+'　cookie:'+cookie+'　key:'+key);
// 	res.setHeader('Set-Cookie',[key + '='+ cookie ]);
// }

// function getCookie(key, req){
// 	console.log('■ getCookie key:'+key);
// 	var cookie_data = req.headers.cookie != undefined ? 
// 		req.headers.cookie : '';

// 	console.log('cookie_data:'+cookie_data);
// 	var data = cookie_data.split(';');
// 	console.log('data:'+data);
// 	for(var i in data ){
// 		if(data[i].trim().startsWith( key + '=' )){
// 			console.log('getCookie ssssssssssssssss key:'+data[i].trim()+'@'+key.length);
// 			var key_val = data[i].trim();
// 			console.log('getCookie ssssssssssssssss key:'+key_val.substring(key.length+1));
// 			var result= key_val.substring(key.length+1);
// 			return unescape(result);
// 		}
// 	}
// }