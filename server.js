const fs = require('fs');
const path = require('path');
const port = 8083;
const express = require('express');
const app = express() 
const jogos_dir = "data/jogos/dados.json";
const posts_dir = "data/posts/dados.json";
const users_dir = "data/users/dados.json";
app.use(express.static('public'));
app.set('view engine', 'ejs');
const expressLayouts = require('express-ejs-layouts'); 
app.use(expressLayouts) 

app.use((req, res, next) => {
    const userId = req.query.user;

	var data = fs.readFileSync(users_dir , "utf8");
	var users = JSON.parse(data); 
	req.query.user = users["usuarios"][userId];

    next(); 
});

app.get('/', (req, res) => {
	const user = req.query.user;
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];

	res.render('index', {jogos: jogos, header: setHeader(user), navclass: {"produtos": "active"}, "user": user, css: "/css/produtos.css"});
})

app.get('/cadastro', (req, res) => {
	const user = req.query.user;
	res.render('cadastro', {layout: "no-header", "user": user, css: "/css/style.css"});
})

app.get('/login', (req, res) => {
	const user = req.query.user;
	res.render('login', {layout: "no-header", "user": user, css: "/css/style.css"});
})

app.get('/esquecer-senha', (req, res) => {
	const user = req.query.user;
	res.render('esquecer-senha', {layout: "no-header", "user": user, css: "/css/style.css"});
})

app.get('/comunidade', (req, res) => {
	const user = req.query.user;
	
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];
	var data = fs.readFileSync(posts_dir , "utf8");
	var posts = JSON.parse(data)["posts"]; 
	for (let index = 0; index < posts.length; index++) {
		posts[index]["user"] = setUser(posts[index]["user"]);
	}
	res.render('comunidade', {jogos: jogos, header: setHeader(user), navclass: {"comunidade": "active"}, "user": user, posts: posts, css: "/css/comunidade.css"});
})

app.get('/post/:id', (req, res) => {
	const user = req.query.user;
	var data = fs.readFileSync(posts_dir , "utf8");
	var posts = JSON.parse(data)["posts"]; 
	var post = posts[req.params.id];
	post["user"] = setUser(post["user"]);
	res.render('post', {header: setHeader(user), navclass: {"comunidade": "active"}, "user": user, post: post, css: "/css/post.css"});
})

app.get('/meus-produtos', (req, res) => {
	const user = req.query.user;
	
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];
	var cartas = [];
	for (let i = 0; i < jogos.length; i++) {
		var jogo = jogos[i];
		for (let j = 0; j < jogo["cartas"].length; j++) {
			var carta = jogo["cartas"][j];
			if(carta["vendedor"] == user["id"]){
				cartas.push(carta);
			}
		}
	}
	res.render('meus-produtos', {header: setHeader(user), navclass: {"meus-produtos": "active"}, "user": user, cartas: cartas, css: "/css/produtos.css"});
})

app.get('/editar-produto/:id', (req, res) => {
	const user = req.query.user;
	const cartaId = req.params.id;
	
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];
	let carta;

	for (let index = 0; index < jogos.length; index++) {
		const jogo = jogos[index];
		for (let j = 0; j < jogo["cartas"].length; j++) {
			const cartaOpt = jogo["cartas"][j];
			if(cartaOpt["id"] == cartaId){
				carta = cartaOpt;
				break;
			}
		}
	}
	
	res.render('editar-produto', {header: setHeader(user), navclass: {"meus-produtos": "active"}, "user": user, carta: carta, css: "/css/produtos.css"});
})

app.get('/produto/:id', (req, res) => {
	const user = req.query.user;
	const cartaId = req.params.id;
	
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];
	let carta;

	for (let index = 0; index < jogos.length; index++) {
		const jogo = jogos[index];
		for (let j = 0; j < jogo["cartas"].length; j++) {
			const cartaOpt = jogo["cartas"][j];
			if(cartaOpt["id"] == cartaId){
				carta = cartaOpt;
				break;
			}
		}
	}
	
	carta["vendedor"] = setUser(carta["vendedor"]);

	res.render('produto', {header: setHeader(user), navclass: {"produtos": "active"}, "user": user, carta: carta, css: "/css/produtos.css"});
})

app.get('/criar-post', (req, res) => {
	const user = req.query.user;
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];

	res.render('criar-post', {jogos: jogos, header: setHeader(user), navclass: {"comunidade": "active"}, "user": user, css: "/css/post.css"});
})

app.get('/add-produto', (req, res) => {
	const user = req.query.user;

	res.render('add-produto', {header: setHeader(user), navclass: {"meus-produtos": "active"}, "user": user, css: "/css/produtos.css"});
})

app.get('/adm', (req, res) => {
	const user = req.query.user;
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];
	var data = fs.readFileSync(users_dir , "utf8");
	var usuarios = JSON.parse(data)["usuarios"];

	res.render('adm', {jogos: jogos, usuarios: usuarios, header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: "/css/adm.css"});
})

app.get('/editar-usuario/:id', (req, res) => {
	const user = req.query.user;
	const userId = req.params.id;

	res.render('editar-usuario', {user: setUser(userId), header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: "/css/adm2.css"});
})

app.get('/editar-jogo/:id', (req, res) => {
	const user = req.query.user;
	const jogoId = req.params.id;
	var data = fs.readFileSync(jogos_dir , "utf8");
	var jogos = JSON.parse(data)["jogos"];

	res.render('editar-jogo', {jogo: jogos[jogoId], header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: "/css/adm.css"});
})

app.listen(port, function () {
	console.log(`Server listening on port ${port}`);
})

function setHeader(user) {
    let header;
	switch(user["perfil"]){
		case "simples":
			header = "headers/default-header.ejs";
			break;
		case "premium":
			header = "headers/premium-header.ejs";
			break;
		case "admin":
			header = "headers/adm-header.ejs";
			break;
		default:
			header = "headers/unlogged-header.ejs";
	}
	return header;
}

function setUser(id) {
    var data = fs.readFileSync(users_dir , "utf8");
	var users = JSON.parse(data)["usuarios"];
	return users[id];
}