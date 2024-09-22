// Dependência: npm i ws express

const http = require('http');
const fs = require('fs');
const port = 8084;
const jogos_path = "data/jogos/dados.json";
const posts_path = "data/posts/dados.json";
const users_path = "data/users/dados.json";
const conversas_path = "data/conversas/dados.json";
const ids_path = "data/ids.json";
const path = require('path');
const multer = require('multer');
const WebSocket = require('ws');
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const maxSize = 1024*1024*2; // 2MB - Limite para upload

const storage = multer.diskStorage({
    // destino do arquivo 
    destination: function (req, file, cb) {
        cb(null, 'public/img')
    },
    // nome do arquivo
    filename: function (req, file, cb) {
        // Muda o nome original no caso de uploads de files com o mesmo nome
        cb(null, file.originalname.replace(/\s+/g, '_'));
    }
});

// configuração da instância do multer
const upload = multer({
    storage : storage,
    limits  : { fileSize: maxSize }
}).array('filename',2);

const server = http.createServer((req, res) => {
	const u = new URL(req.url, `http://${req.headers.host}`);
	
	 // Configurar cabeçalhos CORS
	 res.setHeader('Access-Control-Allow-Origin', '*'); // Permite todas as origens
	 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	 res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	 res.setHeader('Access-Control-Allow-Credentials', 'true');
	 res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';");

	 if(req.method == 'OPTIONS'){
		res.end();
	 }

	  // Verificar token
	  if (req.method === 'GET' && req.url === '/verificar-token') {
		verifyJWT(req, res, () => {
			res.writeHead(200, { 'Content-Type': 'application/json' });
        	res.end(JSON.stringify({ userId: req.id }));
		});
		return;
	} 

	// Verificar perfil ADM e Premium
	if (req.method === 'GET' && req.url === '/verificar-perfil-adm-premium') {
		const userId = req.headers['user-id']; // Captura o userId do cabeçalho

    	verifyPerfilAdmePremium(userId, (err, usuario) => {
        	if (err) {
            	res.writeHead(403, { 'Content-Type': 'application/json' });
            	res.end(JSON.stringify({ error: err.message }));
        	} else {
            	res.writeHead(200, { 'Content-Type': 'application/json' });
            	res.end(JSON.stringify({ message: 'Perfil válido', usuario }));
        	}
    	});
		return;
	} 

	// Verificar perfil ADM
	if (req.method === 'GET' && req.url === '/verificar-perfil-adm') {
		const userId = req.headers['user-id']; // Captura o userId do cabeçalho

    	verifyPerfilAdm(userId, (err, usuario) => {
        	if (err) {
            	res.writeHead(403, { 'Content-Type': 'application/json' });
            	res.end(JSON.stringify({ error: err.message }));
        	} else {
            	res.writeHead(200, { 'Content-Type': 'application/json' });
            	res.end(JSON.stringify({ message: 'Perfil válido', usuario }));
        	}
    	});
		return;
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

	// Carregar mensagens no chat com usuario
	if (req.method === 'GET' && req.url.startsWith('/chat/history')) {
		const urlParams = new URLSearchParams(req.url.split('?')[1]);
		const userId = urlParams.get('user');
		const receiverId = urlParams.get('receiver');
		console.log(`Buscando conversa entre ${userId} e ${receiverId}`);
		
		try {
			// Ler o arquivo de conversas
			const data = fs.readFileSync(conversas_path, 'utf8');
			const jsonData = JSON.parse(data); // Parse do JSON
			
			// Verificar se 'conversas' existe e é um array
			if (!Array.isArray(jsonData.conversas)) {
				throw new Error('Estrutura de conversas inválida');
			}
			
			const conversations = jsonData.conversas;
	
			const conversation = conversations.find(convo => {
				return (
					convo.users.includes(userId) &&
					convo.users.includes(receiverId) &&
					userId !== receiverId // Garante que não é a mesma conversa
				);
			});
		
			if (conversation) {
				// Enviar as mensagens da conversa
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ messages: conversation.messages }));
				console.log('Mensagens:', conversation.messages); 
			} else {
				// Se não houver conversa, retornar array vazio
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ messages: [] }));
				console.log('Mensagens:', []); 
			}
		} catch (error) {
			// Tratamento de erros na leitura ou formatação
			console.error('Erro ao processar o arquivo de conversas:', error);
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'Erro ao carregar conversas' }));
		}
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
		case '/cartasUser':
			getCartasOfUser(res, u);
			break;
		case '/cartas':
			handleCartas(req, res, u);
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
		case '/login':
			if (req.method === 'POST') {
				let body = '';
				req.on('data', chunk => {
					body += chunk.toString(); // Concatena os chunks recebidos
				});
				req.on('end', () => {
					const loginData = new URLSearchParams(body);
					const username = loginData.get('username');
					const senha = sha512(loginData.get('senha'), process.env.SECRET_USERS);
					console.log('Usuário:', username);
					console.log('Senha (hash):', senha);
					if (username && senha) {
						// Authenticação
						var users = JSON.parse(fs.readFileSync(users_path, 'utf8')).usuarios;
						var userloc = users.find((item) => {
							return (item.username === username && item.senha === senha);
						});

						if (userloc) {
							const token = jwt.sign(
								{ id: userloc.id }, // payload
								process.env.SECRET, // chave definida em .env
								{ expiresIn: 10800 }  // em segundos
							);	
							// Define o cookie com o token
							res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=10800; SameSite=None; Secure`); // 5 minutos
							res.writeHead(302, { Location: `http://localhost:8083/?user=${userloc.id}` }); // Redireciona para a home
							res.end();
						} else {
							console.log('### 0 - erro no login');
							res.writeHead(302, {
								'Location': 'http://localhost:8083/login?error=' + encodeURIComponent('Usuário e/ou senha inválidos')
							});
							res.end();
						}
					} else {
						res.writeHead(400, { 'Content-Type': 'text/plain' });
						res.end('Dados inválidos');
					}
				});
			} else {
				res.writeHead(405, { 'Content-Type': 'text/plain' });
				res.end('Method Not Allowed');
			}
			break;
		case '/comprarCarta':
			var body = '';
			req.on('data', function (data) {
				body += data;
				body = JSON.parse(body);
				var user = find(users_path, 'usuarios', body.user);
				var carta = getCarta(body.carta);
				var moedas = Number(user.moedas.replace(/,/g, '.'));
				var preco = Number(carta.preco.replace(/,/g, '.'));
				if(moedas < preco){
					res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8'});	
					res.write("O usuário não tem moedas suficientes");
				} else{
					user.moedas = (moedas - preco).toFixed(2).toString().replace(/\./g, ',');
					user['cartas-compradas'].push({
						nome: carta.nome,
						preco: carta.preco,
						img: carta.frente
					})
					del(users_path, 'usuarios', user.id, true);
					save(users_path, 'usuarios', user);
					var vendedor = carta.vendedor;
					vendedor.moedas = (moedas + preco).toFixed(2).toString().replace(/\./g, ',');
					vendedor['cartas-vendidas'].push({
						nome: carta.nome,
						preco: carta.preco,
						img: carta.frente
					})
					del(users_path, 'usuarios', vendedor.id, true);
					save(users_path, 'usuarios', vendedor);
					deleteCarta(carta.id);
					res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8'});
					res.end();
				}
			});
			req.on('end', function () {
				return res.end();
			}); break;
		case '/updateUsuario':
			updateUsuario(req, res, u);
			break;
		case '/upgrade':
			params = u.searchParams;
			const id = params.get("id");
			var user = find(users_path, 'usuarios', id);
			var moedas = Number(user.moedas.replace(/,/g, '.'));
			if(moedas < 100){
				res.writeHead(401, { 'Content-Type': 'text/plain' });
				res.end('Você precisa de 100 moedas para se tornar premium');
			} else{
				user.moedas = (moedas - 100).toFixed(2).toString().replace(/\./g, ',');
				user.perfil = 'premium'
				del(users_path, 'usuarios', user.id, true);
				save(users_path, 'usuarios', user);
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end();
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
				var id = save(fileName, entity, user);
				res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8'});
				res.write(JSON.stringify({id: id}, null, 2));
			});
			req.on('end', function () {
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
	if(entity === 'usuarios' && data.senha !== undefined){
		data.senha = sha512(data.senha, process.env.SECRET_USERS);
	}
	var allData = list(fileName, entity);
	allData.push(data);
	fs.writeFileSync(fileName, JSON.stringify({[entity]: allData}, null, 2), 'utf8');
	return data.id;
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

function handleCartas(req, res, u){
	params = u.searchParams;
	const id = params.get("id");
	switch(req.method) {
		case 'GET':
			let response
			response = JSON.stringify(getCarta(id), null, 2);
			if (response === undefined) {
                response = {}; // Garantir que `response` nunca seja undefined
            }
			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
			res.write(response);
			return res.end(); break;
		case 'POST':
			upload(req, res, function (err) {
				if (err) {
					return console.log(err.message);
				}
				saveCarta(req, {
					nome: req.body.nome, 
					vendedor: req.body.vendedor, 
					preco: req.body.preco, 
					id: nextId("cartas"),
					frente: "/img/" + req.files[0].filename,
					verso: "/img/" + req.files[1].filename
				})
				res.writeHead(201, { 'Content-Type': 'application/json' });
				return res.end();
			});break;
		case 'PUT':
			upload(req, res, function (err) {
				if (err) {
					return console.log(err.message);
				}
				var oldCarta = undefined;
				let frente;
				let verso;
				if(req.files[0] === undefined){
					oldCarta = getCarta(id);
					frente = oldCarta.frente;
				} else{
					frente = "/img/" + req.files[0].filename;
				}
				if(req.files[1] === undefined){
					if(oldCarta === undefined){
						oldCarta = getCarta(id);
					}
					verso = oldCarta.verso;
				} else{
					verso = "/img/" + req.files[1].filename;
				}
				deleteCarta(id);
				var carta = {
					nome: req.body.nome, 
					vendedor: req.body.vendedor, 
					preco: req.body.preco, 
					id: id,
					frente: frente,
					verso: verso
				};
				saveCarta(req, carta);
				res.writeHead(201, { 'Content-Type': 'application/json' });
				return res.end();
			});break;
		case 'DELETE':
			deleteCarta(id);
			res.writeHead(204, { 'Content-Type': 'text/html; charset=utf-8'});
			return res.end(); break;
	}; 
}

function updateUsuario(req, res, u){
	params = u.searchParams;
	const id = params.get("id");
	switch(req.method) {
		case 'PUT':
			upload(req, res, function (err) {
				if (err) {
					return console.log(err.message);
				}
				var user = find(users_path, 'usuarios', id);
				user.username = req.body.username;
				user.icon = "/img/" + req.files[0].filename;
				del(users_path, 'usuarios', user.id, true);
				save(users_path, 'usuarios', user);
				res.writeHead(201, { 'Content-Type': 'application/json' });
				return res.end();
			});break;
	}; 
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

function saveCarta(req, carta){
	var jogo = find(jogos_path, "jogos", req.body.jogo);
	if(carta.id == undefined){
		carta.id = nextId("cartas");
	}
	jogo.cartas.push(carta);
	del(jogos_path, "jogos", jogo.id, true);
	save(jogos_path, "jogos", jogo);
}

function deleteCarta(id){
	var jogos = list(jogos_path, 'jogos');
		jogos.forEach(jogo => {
			var cartas = jogo['cartas'];
			cartas = cartas.filter(carta => Number(carta["id"]) !== Number(id));
			jogo['cartas'] = cartas;
	})
	fs.writeFileSync(jogos_path, JSON.stringify({jogos: jogos}, null, 2), 'utf8');
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
    
	ganharMoedas(post.user, 10);

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

		ganharMoedas(user.id, 5);

        return comentario;
    } else {
        throw new Error('Post não encontrado!');
    }
}

function ganharMoedas(id, moedas){
	var user = find(users_path, 'usuarios', id);
	user.moedas = (Number(user.moedas.replace(/,/g, '.')) + moedas).toFixed(2).toString().replace(/\./g, ',');
	del(users_path, 'usuarios', id, true);
	save(users_path, 'usuarios', user);
}

// Cria o servidor WebSocket
const wss = new WebSocket.Server({ server });

// Quando o WebSocket recebe uma nova conexão
wss.on('connection', (ws) => {
    // Quando o usuário envia uma mensagem
    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            const { sender, receiver, content } = parsedMessage;

			console.log('Mensagem recebida:', { sender, receiver, content });

            // Carrega as conversas do JSON
            const conversationsData = fs.readFileSync(conversas_path, 'utf8');
            const conversations = JSON.parse(conversationsData).conversas;

            // Encontra a conversa entre os dois usuários
            let conversation = conversations.find(convo =>
                convo.users.includes(sender) && convo.users.includes(receiver)
            );

            const user = getUserData(sender);

            const newMessage = {
                sender,
                message: content,
                timestamp: new Date().toISOString(),
                icon: user.icon,
				username: user.username
            };

            if (conversation) {
                // Se a conversa já existir, adiciona a nova mensagem
                conversation.messages.push(newMessage);
            } else {
                // Se a conversa não existir, cria uma nova
                conversations.push({
                    id: conversations.length + 1, // gera um novo ID
                    users: [sender, receiver],
                    messages: [newMessage]
                });
            }

            // Salva as conversas atualizadas no JSON
            fs.writeFileSync(conversas_path, JSON.stringify({ conversas: conversations }, null, 2));

            console.log('Mensagem recebida e salva:', newMessage);
        } catch (error) {
            console.error('Erro ao processar a mensagem:', error);
        }
    });
});

//========================================================== Login
var sha512 = (pwd, key) => {
    /* Gera um HMAC (Hash-based Message Authentication Code) 
     usando a função de hash SHA512
     a chave é passada em key
     */
    var hash = crypto.createHmac('sha512', key)
    hash.update(pwd)
    return hash.digest('hex') 
}

//========================================================== Verificação
const blacklist = []

// Função para ler cookies do header
function parseCookies(req) {
    const cookieHeader = req.headers.cookie; 
    const cookies = {};

    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.split('=');
            cookies[name.trim()] = decodeURIComponent(value); 
        });
    }

    return cookies;
}

// Verificação do perfil do usuário ADM e Premium
function verifyPerfilAdmePremium(userId, callback) {
    fs.readFile(users_path, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }

        const usuarios = JSON.parse(data).usuarios;
        const usuario = usuarios.find(u => u.id === Number(userId));

        if (usuario && (usuario.perfil === 'admin' || usuario.perfil === 'premium')) {
            callback(null, usuario); // Retorna o usuário se permitido
        } else {
            callback(new Error('Acesso negado'), null);
        }
    });
}

// Verificação do perfil do ADM
function verifyPerfilAdm(userId, callback) {
    fs.readFile(users_path, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }

        const usuarios = JSON.parse(data).usuarios;
        const usuario = usuarios.find(u => u.id === Number(userId));

        if (usuario && (usuario.perfil === 'admin')) {
            callback(null, usuario); // Retorna o usuário se permitido
        } else {
            callback(new Error('Acesso negado'), null);
        }
    });
}


// Verificação da validade do token 
// (função usada como middleware na rota '/clients')
function verifyJWT(req, res, callback) {
    const cookies = parseCookies(req);
    const token = cookies.token;

    const index = blacklist.findIndex(item => item === token);

    if (index !== -1) {
        console.log('### 1 - está na blacklist');
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('está na blacklist - fazer login novamente!');
        return;
    } else {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                console.log('### 2 - erro na verificação');
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('token inválido - fazer login novamente');
                return;
            } else {
                req.id = decoded.id; 
                callback(); 
            }
        });
    }
}

function plmdds(req, res, u){
	params = u.searchParams;
	const id = params.get("id");
	upload(req, res, function (err) {
		if (err) {
			return console.log(err.message);
		}
		var user = find(users_path, 'usuarios', id);
		user.username = req.body.username;
		user.icon = "/img/" + req.files[0].filename;
		del(users_path, 'usuarios', user.id, true);
		save(users_path, 'usuarios', user);
		res.writeHead(201, { 'Content-Type': 'application/json' });
		return res.end();
	});
}