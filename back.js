const http = require('http');
const fs = require('fs');
const port = 8084;
const jogos_path = "data/jogos/dados.json";
const posts_path = "data/posts/dados.json";
const users_path = "data/users/dados.json";
const ids_path = "data/ids.json";

http.createServer((req, res) => {
	const u = new URL(req.url, `http://${req.headers.host}`);

	 // Configurar cabeçalhos CORS
	 res.setHeader('Access-Control-Allow-Origin', '*'); // Permite todas as origens
	 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	 res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    switch (u.pathname) {

        case '/usuarios':
			handleGeneralFiles(req, res, u, users_path, "usuarios");
			break;
		case '/jogos':
			handleGeneralFiles(req, res, u, jogos_path, "jogos");
			break;
		case '/posts':
			handleGeneralFiles(req, res, u, posts_path, "posts");
			break;
		case '/cartas':
			getCartasOfUser(res, u);
			break;
		case '/carta':
			handleGetCarta(res, u);
			break;
		case '/criar-post':
			if (req.method === 'POST') {
				let body = '';
				req.on('data', chunk => {
					body += chunk.toString(); // Concatena os chunks recebidos
				});
				req.on('end', () => {
					const postData = new URLSearchParams(body);
					const newPost = createPost({
						titulo: postData.get('titulo'),
						texto: postData.get('texto'),
						jogo: postData.get('tipo'), 
						user: postData.get('user') 
					});
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify(newPost));
				});
			} else {
				res.writeHead(405, { 'Content-Type': 'text/plain' });
				res.end('Method Not Allowed');
			}
			break;
    }

}).listen(port, () => console.log(`Api is running on port ${port}`));

function handleGeneralFiles(req, res, u, fileName, entity){
	const cors = {'Access-Control-Allow-Origin': '*'};
	params = u.searchParams;
	const id = params.get("id");
	const filtro = params.get("filtro");
	switch(req.method) {
		case 'GET':
			let response
			if(id == undefined){
				response = list(fileName, entity, filtro);
			} else {
				response = find(fileName, entity, id);
			}
			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' , 'Access-Control-Allow-Origin': '*'});
			res.write(JSON.stringify(response, null, 2));
			return res.end(); break;
		case 'POST':
			var body = '';
			req.on('data', function (data) {
				body += data;
				body = JSON.parse(body);
				var user = body;
				save(fileName, entity, user);
			});
			req.on('end', function () {
				res.writeHead(201, cors);
				return res.end();
			}); break;
		case 'PUT':
			del(fileName, entity, id);
			var body = '';
			req.on('data', function (data) {
				body += data;
				body = JSON.parse(body);
				var user = body;
				console.log(user);
				save(fileName, entity, user);
			}); 
			req.on('end', function () {
				res.writeHead(201, cors);
				return res.end();
			}); break;
		case 'DELETE':
			del(fileName, entity, id);
			res.writeHead(204, cors);
			return res.end(); break;
	}; 
}

function nextId(entity){
	var data = fs.readFileSync(ids_path , "utf8");
	var ids = JSON.parse(data);
	var id = ids[entity];
	ids[entity] = Number(id) + 1;
	fs.writeFileSync(ids_path, JSON.stringify(ids, null, 2), 'utf8');
	return id;
}

function list(fileName, entity, filtro){
	var file = fs.readFileSync(fileName , "utf8");
	var data = JSON.parse(file)[entity];
	if(entity == 'posts'){
		for (let index = 0; index < data.length; index++) {
			data[index]["user"] = find(users_path, "usuarios",data[index]["user"]);
		}
	}
	return filtrar(data, entity, filtro);
}

function filtrar(data, entity, filtro){
	if(filtro != undefined && filtro != null && filtro != ""){
		switch(entity){
			case 'posts':
				return data.filter(post => post["jogo"] == filtro);
			case 'jogos':
				return data.filter(jogo => jogo["nome"] == filtro);
		}
	}
	return data;
}

function find(fileName, entity, id){
	var data = list(fileName, entity);
	return data.filter(o => Number(o["id"]) === Number(id))[0];
}

function save(fileName, entity, data){
	if(data.id == undefined){
		data.id = nextId(entity);
	}
	var allData = list(fileName, entity);
	allData.push(data);
	fs.writeFileSync(fileName, JSON.stringify({[entity]: allData}, null, 2), 'utf8');
}

function del(fileName, entity, id){
	var data = list(fileName, entity);
	const newData = data.filter(o => Number(o["id"]) !== Number(id));
	fs.writeFileSync(fileName, JSON.stringify({[entity]: newData}, null, 2), 'utf8');
}

function getCartasOfUser(res, u){
	params = u.searchParams;
	const id = params.get("id");
	var jogos = list(jogos_path, "jogos");
	var cartas = [];
	for (let i = 0; i < jogos.length; i++) {
		var jogo = jogos[i];
		for (let j = 0; j < jogo["cartas"].length; j++) {
			var carta = jogo["cartas"][j];
			if(carta["vendedor"] == id){
				cartas.push(carta);
			}
		}
	}
	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' , 'Access-Control-Allow-Origin': '*'});
	res.write(JSON.stringify(cartas, null, 2));
	return res.end();
}

function handleGetCarta(res, u){
	params = u.searchParams;
	const id = params.get("id");
	const carta = getCarta(id);
	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' , 'Access-Control-Allow-Origin': '*'});
	res.write(JSON.stringify(carta, null, 2));
	return res.end();
}

function getCarta(id){
	var jogos = list(jogos_path, "jogos");
	for (let i = 0; i < jogos.length; i++) {
		var jogo = jogos[i];
		for (let j = 0; j < jogo["cartas"].length; j++) {
			var carta = jogo["cartas"][j];
			if(carta["id"] == id){
				carta["vendedor"] = find(users_path, "usuarios", carta["vendedor"]);
				return carta;
			}
		}
	}
}

// Função para criar um novo post
function createPost(postData) {
    const newId = nextId('posts'); // Gera um novo ID para o post
    const post = {
        id: newId,
        user: postData.user, 
        titulo: postData.titulo,
        jogo: postData.jogo,
        texto: postData.texto,
        comentarios: []
    };
    
    const posts = JSON.parse(fs.readFileSync(posts_path, 'utf8')).posts;
    posts.unshift(post);
    fs.writeFileSync(posts_path, JSON.stringify({ posts }, null, 2), 'utf8');
    
    return post;
}