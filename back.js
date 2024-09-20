const http = require('http');
const fs = require('fs');
const port = 8084;
const jogos_path = "data/jogos/dados.json";
const posts_path = "data/posts/dados.json";
const users_path = "data/users/dados.json";
const ids_path = "data/ids.json";
const path = require('path');
const multer = require('multer');

const maxSize = 1024*1024*2; // 2MB - Limite para upload

const storage = multer.diskStorage({
    // destino do arquivo 
    destination: function (req, file, cb) {
        cb(null, 'public/img')
    },
    // nome do arquivo
    filename: function (req, file, cb) {
        // Muda o nome original no caso de uploads de files com o mesmo nome
        cb(null, file.originalname);
    }
});

// configuração da instância do multer
const upload = multer({
    storage : storage,
    limits  : { fileSize: maxSize }
}).array('filename',2);

http.createServer((req, res) => {
	const u = new URL(req.url, `http://${req.headers.host}`);
	
	 // Configurar cabeçalhos CORS
	 res.setHeader('Access-Control-Allow-Origin', '*'); // Permite todas as origens
	 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	 res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	 res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';");

	 if(req.method == 'OPTIONS'){
		res.end();
	 }
	 

	 // Verificar o caminho e o método da requisição
	 if (u.pathname.match(/^\/post\/(\d+)$/) && req.method === 'POST') {
		const postId = parseInt(u.pathname.split('/')[2], 10);
	
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
	
		req.on('end', () => {
			// Usa URLSearchParams para processar dados application/x-www-form-urlencoded
			const commentData = new URLSearchParams(body);
			const newComment = createComentario(postId, {
				userId: commentData.get('user'),
				texto: commentData.get('texto')
			});
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(newComment));
		});
	
		return; // Adiciona um return para evitar o processamento de outras rotas
	}

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
		case '/criarCarta':
			upload(req, res, function (err) {
				if (err) {
					return console.log(err.message);
				}
				console.log(req.body.nome);
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end();
			});
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
		case '/favicon.ico':
			const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
            fs.readFile(faviconPath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Erro ao carregar favicon.ico');
                } else {
                    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
                    res.end(data);
                }
            });
            break;
		default:
			res.writeHead(404,{'Content-Type': 'text/html; charset=utf-8'});
			res.write(`<h1> O recurso ${u.pathname} é desconhecido.</h1>`);
			res.end()
    }

}).listen(port, () => console.log(`Api is running on port ${port}`));

function handleGeneralFiles(req, res, u, fileName, entity){
	params = u.searchParams;
	const id = params.get("id");
	switch(req.method) {
		case 'GET':
			let response
			if(id == undefined){
				response = list(fileName, entity, params);
			} else {
				response = find(fileName, entity, id);
			}
			if (response === undefined) {
                response = {}; // Garantir que `response` nunca seja undefined
            }
			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
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
				res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8'});
				return res.end();
			}); break;
		case 'PUT':
			del(fileName, entity, id, true);
			var body = '';
			req.on('data', function (data) {
				body += data;
				body = JSON.parse(body);
				var user = body;
				save(fileName, entity, user);
			}); 
			req.on('end', function () {
				res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8'});
				return res.end();
			}); break;
		case 'DELETE':
			del(fileName, entity, id);
			res.writeHead(204, { 'Content-Type': 'text/html; charset=utf-8'});
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

function list(fileName, entity, params){
	var file = fs.readFileSync(fileName , "utf8");
	var data = JSON.parse(file)[entity];
	if(params == undefined){
		return data;
	}
	switch(entity){
		case 'usuarios':
			return listUsuarios(data, params);
		case 'jogos':
			return listJogos(data, params);
		case 'posts':
			return listPosts(data, params);
	}
}

function listUsuarios(usuarios, params){
	const username = params.get("username");
	if(username != undefined && username != null && username != ""){
		usuarios = usuarios.filter(user => user["username"].toLowerCase().includes(username.toLowerCase()));
	}
	return usuarios;
}

function listJogos(jogos, params){
	const nome = params.get("nome");
	const cartaNome = params.get("cartaNome");
	if(nome != undefined && nome != null && nome != ""){
		jogos = jogos.filter(jogo => jogo["nome"].toLowerCase().includes(nome.toLowerCase()));
	}
	if(cartaNome != undefined && cartaNome != null && cartaNome != ""){
		jogos.forEach(jogo => {
			var cartas = jogo['cartas'];
			cartas = cartas.filter(carta => carta["nome"].toLowerCase().includes(cartaNome.toLowerCase()));
			jogo['cartas'] = cartas;
		})
	}
	return jogos;
}

function listPosts(posts, params){
	const titulo = params.get("titulo");
	const jogo = params.get("jogo");
	if(titulo != undefined && titulo != null && titulo != ""){
		posts = posts.filter(post => post["titulo"].toLowerCase().includes(titulo.toLowerCase()));
	}
	if(jogo != undefined && jogo != null && jogo != ""){
		posts = posts.filter(post => post["jogo"].toLowerCase().includes(jogo.toLowerCase()));
	}
	for (let index = 0; index < posts.length; index++) {
		posts[index]["user"] = find(users_path, "usuarios",posts[index]["user"]);
	}
	return posts;
}

function find(fileName, entity, id){
	var data = list(fileName, entity);
	if(entity == 'posts'){
		for (let index = 0; index < data.length; index++) {
			data[index]["user"] = find(users_path, "usuarios",data[index]["user"]);
		}
	}
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

function del(fileName, entity, id, update){
	var data = list(fileName, entity);
	const newData = data.filter(o => Number(o["id"]) !== Number(id));
	fs.writeFileSync(fileName, JSON.stringify({[entity]: newData}, null, 2), 'utf8');
	if(entity == 'usuarios' && update == undefined){

		var jogos = list(jogos_path, 'jogos');
		jogos.forEach(jogo => {
			var cartas = jogo['cartas'];
			cartas = cartas.filter(carta => Number(carta["vendedor"]) !== Number(id));
			jogo['cartas'] = cartas;
		})

		fs.writeFileSync(jogos_path, JSON.stringify({jogos: jogos}, null, 2), 'utf8');

		var file = fs.readFileSync(posts_path , "utf8");
		var posts = JSON.parse(file)['posts'];
		posts = posts.filter(post => Number(post["user"]) !== Number(id));

		fs.writeFileSync(posts_path, JSON.stringify({posts: posts}, null, 2), 'utf8');
	}
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
	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
	res.write(JSON.stringify(cartas, null, 2));
	return res.end();
}

function handleGetCarta(res, u){
	params = u.searchParams;
	const id = params.get("id");
	const carta = getCarta(id);
	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
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
				carta["jogo"] = jogo["nome"];
				return carta;
			}
		}
	}
}

function getUserData(userId) {
    const data = fs.readFileSync(users_path, 'utf8');
    const users = JSON.parse(data).usuarios;
    return users.find(user => user.id === parseInt(userId, 10));
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

function createComentario(postId, commentData) {
    const data = JSON.parse(fs.readFileSync(posts_path, 'utf8'));

    const post = data.posts.find(post => post.id === postId);

    if (post) {
        const user = getUserData(commentData.userId);

        if (!user) {
            throw new Error('Usuário não encontrado!');
        }

        const comentario = {
            user: {
                id: user.id,
                username: user.username,
                icon: user.icon
            },
            texto: commentData.texto
        };

        post.comentarios = post.comentarios || [];
        post.comentarios.unshift(comentario);

        fs.writeFileSync(posts_path, JSON.stringify(data, null, 2), 'utf8');

        return comentario;
    } else {
        throw new Error('Post não encontrado!');
    }
}