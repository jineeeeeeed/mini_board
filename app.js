const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const ejs = require('ejs');
//------------------------------
const hostname = 'localhost';
const port = 3000;
var request;
var response;

//同期
const index_page = fs.readFileSync('./index.ejs','UTF-8');
const other_page = fs.readFileSync('./other.ejs','UTF-8');
const board_page = fs.readFileSync('./board.ejs','UTF-8');
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
		case '/other':
			console.log('■■ other:'+url_parts.pathname);
			other_render(req,res);
			break;
		case '/board':
			console.log('■■ board:'+url_parts.pathname);
			board_render(req,res,url_parts);
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
			res.write('no');
			res.end();
			break;
	}
}

//------------------------------------------------------------
//画面ごとの処理
//------------------------------------------------------------
var data = {msg:'初期表示'};

//TOPページ
function indeX_render(req,res,url_parts){
	//既にロード済のページにレンだー
	var content = ejs.render(index_page,{
		title:'indexタイトル'
	});
	content = content.replace('１ss１１','置換しました');
	//パラメータを取得してcontentに追記
	var query = url_parts.query;
	if(query.apple != undefined){
		content +='URLパラメタ（apple）： ' +query.apple;
	}else {
		content +='URLパラメタ：なし' ;
	}
	write(res,content);
}

//POST確認画面
function other_render(req,res){
	//POST
	if(req.method == 'POST'){
		var body ='';
		//データ受信のイベント処理
		req.on('data', function(chunk) {
			body += chunk
			console.log('■データ受信のイベント処理 :'+chunk+ '受信→に追記'+body);
		});
		//データ受信終了のイベント処理
		req.on('end', function() {
			var postdata = querystring.parse(body);
			console.log('■データ受信終了のイベント処理 ');
			// パース後はキー（name）を指定すると値が取得できる
			var apple = postdata.apple;
			console.log('■ パース後はキー（name）を指定すると値が取得できる:'+apple);
			var content = ejs.render(other_page,{
				title:'POSTで遷移',
				msg:'POST!'+apple
			});
			write(res,content);
		});

	//GET
	} else {
		//既にロード済のページにレンだー
		var content = ejs.render(other_page,{
			title:'GETで遷移',
			msg:'GET!'
		});
		write(res,content);
	}
}

//掲示板
function board_render(req,res,url_parts){
	//POST
	if(req.method == 'POST'){
		var body ='';
		//データ受信のイベント処理
		req.on('data', function(chunk) {
			body += chunk
			console.log('data@'+body);
		});
		//データ受信終了のイベント処理
		req.on('end', function() {
			data = querystring.parse(body);
			console.log('d end@'+body);
			setCookie('msg' ,data.msg ,res);
			write_board(req,res);
		});
	} else {
		console.log('not POST');
		// data = {msg:'not POST'};
		write_board(req,res);
	}
}

//-----------------------------------

function setCookie(key ,val ,res){
	var cookie = escape(val);
	console.log('■ setCookie val:'+val+'　cookie:'+cookie+'　key:'+key);
	res.setHeader('Set-Cookie',[key + '='+ cookie ]);
}

function getCookie(key, req){
	console.log('■ getCookie key:'+key);
	var cookie_data = req.headers.cookie != undefined ? 
		req.headers.cookie : '';

	console.log('cookie_data:'+cookie_data);
	var data = cookie_data.split(';');
	console.log('data:'+data);
	for(var i in data ){
		if(data[i].trim().startsWith( key + '=' )){
			console.log('getCookie ssssssssssssssss key:'+data[i].trim()+'@'+key.length);
			var key_val = data[i].trim();
			console.log('getCookie ssssssssssssssss key:'+key_val.substring(key.length+1));
			var result= key_val.substring(key.length+1);
			return unescape(result);
		}
	}
}

function write(res,content){
	res.writeHead(200,{'Content-Type':'text/html'});
	res.write(content);
	res.end();
}

function write_board(req,res){
	var msg ='※伝言を表示します';
	var cookie_da_ta = getCookie('msg',req)
	
	console.log(data.msg+'cookie_da_ta:'+cookie_da_ta);
	var content = ejs.render(board_page,{
		title:'indexタイトル',
		content:msg,
		cookie_data:cookie_da_ta,
		data:data	
	});
	write(res,content);
}
