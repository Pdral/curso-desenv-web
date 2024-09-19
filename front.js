const api = "http://localhost:8084";
const port = 8083;
const express = require('express');
const app = express() 
app.use(express.static('public'));
app.set('view engine', 'ejs');
const expressLayouts = require('express-ejs-layouts'); 
app.use(expressLayouts) 
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Middleware para parsing de dados de formulário (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Middleware para parsing de dados JSON (application/json), caso precise usar JSON
app.use(express.json());

app.get('/favicon.ico', (req, res) => {
    res.redirect('http://localhost:8084/favicon.ico');
});

app.use((req, res, next) => {
    const userId = req.query.user;

	if(userId == undefined || userId == ""){
		req.query.user = {"perfil": "visitante", "id": undefined};
		next();
	} else{
		fetch(api + '/usuarios?id=' + userId).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(user => {
			req.query.user = user;
			next();
		})
	}
});

app.get('/', (req, res) => {
	const user = req.query.user;
	var nome = req.query.nome;
	if(nome == undefined){
		nome = "";
	}
	var cartaNome = req.query.cartaNome;
	if(cartaNome == undefined){
		cartaNome = "";
	}
	// Lê o cookie 'theme' enviado pelo cliente
	const theme = req.cookies.theme || 'light';
	// Define o CSS com base no tema
	const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';

	fetch(api + '/jogos?nome=' + nome + '&cartaNome=' + cartaNome).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(jogos => {
		if (req.xhr) {
			res.json({jogos : jogos});
		} else {
			res.render('index', {jogos: jogos, header: setHeader(user), navclass: {"produtos": "active"}, "user": user, css: selectedCSS});
		}
	})
})

app.get('/cadastro', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/style2.css' : '/css/style.css';
	res.render('cadastro', {layout: "no-header", "user": user, css: selectedCSS});
})

app.get('/login', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/style2.css' : '/css/style.css';
	res.render('login', {layout: "no-header", "user": user, css: selectedCSS});
})

app.get('/esquecer-senha', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/style2.css' : '/css/style.css';
	res.render('esquecer-senha', {layout: "no-header", "user": user, css: selectedCSS});
})

app.get('/comunidade', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/comunidade2.css' : '/css/comunidade.css';

	var titulo = req.query.titulo;
	if(titulo == undefined){
		titulo = "";
	}
	var jogo = req.query.jogo;
	if(jogo == undefined){
		jogo = "";
	}

	fetch(api + '/jogos').then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(jogos => {
		fetch(api + '/posts?jogo=' + jogo + '&titulo=' + titulo).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(posts => {
			res.render('comunidade', {posts: posts, jogos: jogos, header: setHeader(user), navclass: {"comunidade": "active"}, "user": user, css: selectedCSS});
		})
	})
})

app.get('/post/:id', (req, res) => {
	const user = req.query.user;
    const postId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/post2.css' : '/css/post.css';
	fetch(api + '/posts?id='+req.params.id).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(post => {
		res.render('post', {header: setHeader(user), navclass: {"comunidade": "active"}, "user": user, postId: postId, post: post, css: selectedCSS});
	})
})

app.get('/meus-produtos', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';

	if (req.xhr) {
		fetch(api + '/cartas?id=' + user["id"]).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(cartas => {
			res.json({ 
				cartasCompradas: user["cartas-compradas"],
				cartasVendidas: user["cartas-vendidas"],
				cartas: cartas || [] 
			});
		})
		
	} else {
		res.render('meus-produtos', {header: setHeader(user), navclass: {"meus-produtos": "active"}, "user": user, dono: user, css: selectedCSS});
	}})

app.get('/meus-produtos/:id', (req, res) => {
    const user = req.query.user;
    const donoId = req.params.id;
    const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
    
    fetch(api + '/usuarios?id=' + donoId).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(dono => {
		if (req.xhr) {
			fetch(api + '/cartas?id=' + donoId).then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				var a = response.json();
				return a;
			})
			.then(cartas => {
				res.json({ 
					cartasCompradas: dono["cartas-compradas"],
					cartasVendidas: dono["cartas-vendidas"],
					cartas: cartas || [] 
				});
			})
			
		} else {
			res.render('meus-produtos', {
				header: setHeader(user), 
				navclass: { "meus-produtos": "active" }, 
				user: user, 
				dono: dono, 
				css: selectedCSS
			});
		}})
	});

app.get('/editar-produto/:id', (req, res) => {
	const user = req.query.user;
	const cartaId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	
	fetch(api + '/carta?id=' + cartaId).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(carta => {
		res.render('editar-produto', {header: setHeader(user), navclass: {"meus-produtos": "active"}, "user": user, carta: carta, css: selectedCSS});
	})
})

app.get('/produto/:id', (req, res) => {
	const user = req.query.user;
	const cartaId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	
	fetch(api + '/carta?id=' + cartaId).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(carta => {
		res.render('produto', {header: setHeader(user), navclass: {"produtos": "active"}, "user": user, carta: carta, css: selectedCSS});
	})
})

app.get('/criar-post', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/post2.css' : '/css/post.css';
	
	fetch(api + '/jogos').then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(jogos => {
		res.render('criar-post', {jogos: jogos, header: setHeader(user), navclass: {"comunidade": "active"}, "user": user, css: selectedCSS});
	})
})

app.get('/add-produto', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';

	res.render('add-produto', {header: setHeader(user), navclass: {"meus-produtos": "active"}, "user": user, css: selectedCSS});
})

app.get('/adm', (req, res) => {
	const user = req.query.user;
	var nomeUsuario = req.query.nomeUsuario;
	var nomeJogo = req.query.nomeJogo;

	if(nomeUsuario == undefined){
		nomeUsuario = '';
	}
	if(nomeJogo == undefined){
		nomeJogo = '';
	}
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';

	if (req.xhr) {
		fetch(api + '/jogos?nome=' + nomeJogo).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(jogos => {
			fetch(api + '/usuarios?username=' + nomeUsuario).then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				var a = response.json();
				return a;
			})
			.then(usuarios => {
				res.json({ 
					jogos: jogos,
					usuarios: usuarios
				});
			})
		})
	} else{
		res.render('adm', {header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: selectedCSS});
	}
	
})

app.get('/editar-usuario/:id', (req, res) => {
	const user = req.query.user;
	const userId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';

	fetch(api + '/usuarios?id=' + userId).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(usuario => {
		res.render('editar-usuario', {usuario: usuario, header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: selectedCSS});
	})
})

app.get('/editar-jogo/:id', (req, res) => {
	const user = req.query.user;
	const jogoId = req.params.id;
	let jogo;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';

	fetch(api + '/jogos?id=' + jogoId).then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		var a = response.json();
		return a;
	})
	.then(jogo => {
		res.render('editar-jogo', {jogo: jogo, header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: selectedCSS});
	})
})

app.get('/criar-jogo', (req, res) => {
	const user = req.query.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';

	res.render('criar-jogo', {header: setHeader(user), navclass: {"adm": "active"}, "user": user, css: selectedCSS});
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