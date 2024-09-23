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
    // Verifica o token na API
	fetch(api + '/verificar-token', {
        method: 'GET',
        headers: {
            Cookie: req.headers.cookie // Inclui os cookies na requisição
        }
    })
    .then(tokenResponse => {
		if(!tokenResponse.ok){
			req.user = undefined;
			next();
		} 
		return tokenResponse.json();
    })
	.then(json => {
		req.user = json.userId;
		next();
	})
    .catch(error => {
        console.error('Erro ao ler token:', error);
    });
});

app.get('/', async (req, res) => {
    const nome = req.query.nome || "";
    const cartaNome = req.query.cartaNome || "";
	const userId = req.user;
    
    // Lê o cookie 'theme' enviado pelo cliente
    const theme = req.cookies.theme || 'light';
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
    
    const cookies = req.headers.cookie;

	// Busca os jogos
	const jogosResponse = await fetch(api + '/jogos?nome=' + nome + '&cartaNome=' + cartaNome);
	if (!jogosResponse.ok) {
		throw new Error('Network response was not ok');
	}
	const jogos = await jogosResponse.json();

    if(!req.xhr){
		try {
			if(userId == undefined){
				return res.render('index', {jogos: jogos, header: setHeader("visitante"), navclass: {"produtos": "active"}, user: { perfil: "visitante", id: undefined }, css: selectedCSS});
			}

			// Verifica o perfil na API
			const perfilResponse = await fetch(api + '/verificar-perfil', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Cookie: cookies,
					'User-ID': userId
				}
			});
	
			if (!perfilResponse.ok) {
				throw new Error('Perfil inválido');
			}
	
			const { usuario } = await perfilResponse.json();
			return res.render('index', {jogos: jogos, header: setHeader(usuario.perfil), navclass: { "produtos": "active" }, user: usuario, css: selectedCSS});
			
		} catch (error) {
			console.error('Erro:', error);
			return res.redirect('/login'); // Redireciona em caso de erro
		}
	} else{
		res.json({jogos : jogos});
	}
});


app.get('/cadastro', (req, res) => {
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/style2.css' : '/css/style.css';
	let errorMessage = null;

	if (req.query.error) {
        try {
            errorMessage = decodeURIComponent(req.query.error);
        } catch (e) {
            console.error('Erro ao decodificar a mensagem de erro:', e);
            errorMessage = 'Erro de cadastro'; // mensagem genérica em caso de erro
        }
    }
	res.render('cadastro', {layout: "no-header", css: selectedCSS, error: errorMessage});
})

app.get('/login', (req, res) => {
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/style2.css' : '/css/style.css';
	let errorMessage = null;

    if (req.query.error) {
        try {
            errorMessage = decodeURIComponent(req.query.error);
        } catch (e) {
            console.error('Erro ao decodificar a mensagem de erro:', e);
            errorMessage = 'Erro de login'; // mensagem genérica em caso de erro
        }
    }
	res.render('login', {layout: "no-header", css: selectedCSS, error: errorMessage});
})

app.get('/esquecer-senha', (req, res) => {
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/style2.css' : '/css/style.css';
	res.render('esquecer-senha', {layout: "no-header", css: selectedCSS});
})

app.get('/comunidade', async (req, res) => {
	const userId = req.user;
    const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/comunidade2.css' : '/css/comunidade.css';

    const titulo = req.query.titulo || "";
    const jogo = req.query.jogo || "";
    const cookies = req.headers.cookie;

    try {

		if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm-premium', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }

        const { usuario } = await perfilResponse.json(); 

        // Carrega os jogos e posts
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
				res.render('comunidade', {posts: posts,	jogos: jogos, header: setHeader(usuario.perfil), navclass: {"comunidade": "active"}, "user": usuario, css: selectedCSS});
			})
		})
    } catch (error) {
        console.error('Erro:', error);
        res.redirect('/'); // Redireciona para a home 
    }
});

app.get('/post/:id', async (req, res) => {
	const userId = req.user;
    const postId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/post2.css' : '/css/post.css';
	const cookies = req.headers.cookie;

	try {
		
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm-premium', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }
		
		const { usuario } = await perfilResponse.json(); 

		fetch(api + '/jogos').then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(jogos => {
			fetch(api + '/posts?id='+req.params.id).then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				var a = response.json();
				return a;
			})
			.then(post => {
				res.render('post', {header: setHeader(usuario.perfil), navclass: {"comunidade": "active"}, "user": usuario, postId: postId, post: post, css: selectedCSS});
			})
		})
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
    }
})

app.get('/meus-produtos', async (req, res) => {
	const userId = req.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

		// Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }

        const { usuario } = await perfilResponse.json(); 

		if (req.xhr) {
			fetch(api + '/cartasUser?id=' + usuario.id).then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				var a = response.json();
				return a;
			})
			.then(cartas => {
				res.json({ 
					cartasCompradas: usuario["cartas-compradas"],
					cartasVendidas: usuario["cartas-vendidas"],
					cartas: cartas || [] 
				});
			})
			
		} else {
			res.render('meus-produtos', {header: setHeader(usuario.perfil), navclass: {"meus-produtos": "active"}, "user": usuario, dono: usuario, css: selectedCSS});
		}
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
	}
	})

app.get('/meus-produtos/:id', async (req, res) => {
    const userId = req.user;
    const donoId = req.params.id;
    const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	const cookies = req.headers.cookie;

	const donoResponse = await fetch(api + '/usuarios?id=' + donoId);
	if (!donoResponse.ok) {
		throw new Error('Network response was not ok');
	}
	const dono = await donoResponse.json();

	try {
		if (req.xhr) {
			fetch(api + '/cartasUser?id=' + donoId).then(response => {
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
			if(userId == undefined){
				return res.render('meus-produtos', {
					header: setHeader('visitante'), 
					navclass: { "meus-produtos": "active" },
					dono: dono, 
					css: selectedCSS
				});
			}
	
			// Verifica o perfil na API
			const perfilResponse = await fetch(api + '/verificar-perfil', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Cookie: cookies,
					'User-ID': userId // Enviando o userId no cabeçalho
				}
			});
	
			if (!perfilResponse.ok) {
				throw new Error('Perfil inválido'); // Caso o perfil não seja válido
			}
	
			const { usuario } = await perfilResponse.json(); 
	
			res.render('meus-produtos', {
				header: setHeader(usuario.perfil), 
				navclass: { "meus-produtos": "active" }, 
				user: usuario, 
				dono: dono, 
				css: selectedCSS
			});
		}
		
	} catch (error) {
		console.error('Erro:', error);
		res.redirect(`/`); // Redireciona para a home
	}
	});

app.get('/editar-produto/:id', async (req, res) => {
	const userId = req.user;
	const cartaId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

		// Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }

        const { usuario } = await perfilResponse.json(); 

		fetch(api + '/jogos').then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(jogos => {
			fetch(api + '/cartas?id=' + cartaId).then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				var a = response.json();
				return a;
			})
			.then(carta => {
				res.render('editar-produto', {jogos: jogos, header: setHeader(usuario.perfil), navclass: {"meus-produtos": "active"}, "user": usuario, carta: carta, css: selectedCSS});
			})
		})
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
	}	
})

app.get('/produto/:id', async (req, res) => {
	const userId = req.user;
	const cartaId = req.params.id;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	const cookies = req.headers.cookie;

	const cartaResponse = await fetch(api + '/cartas?id=' + cartaId);
	if (!cartaResponse.ok) {
		throw new Error('Network response was not ok');
	}
	const carta = await cartaResponse.json();

	if(carta.vendedor.id === userId){
		return res.redirect('/editar-produto/' + cartaId);
	} 

	try {
		if(userId == undefined){
			return res.render('produto', {header: setHeader('visitante'), navclass: {"produtos": "active"}, carta: carta, css: selectedCSS});
		}

		// Verifica o perfil na API
		const perfilResponse = await fetch(api + '/verificar-perfil', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Cookie: cookies,
				'User-ID': userId // Enviando o userId no cabeçalho
			}
		});

		if (!perfilResponse.ok) {
			throw new Error('Perfil inválido'); // Caso o perfil não seja válido
		}

		const { usuario } = await perfilResponse.json(); 

		res.render('produto', {header: setHeader(usuario.perfil), navclass: {"produtos": "active"}, "user": usuario, carta: carta, css: selectedCSS});
		
	} catch (error) {
		console.error('Erro:', error);
		res.redirect(`/`); // Redireciona para a home
	}
})

app.get('/criar-post', async (req, res) => {
	const userId = req.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/post2.css' : '/css/post.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm-premium', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }		

		const { usuario } = await perfilResponse.json(); 

		fetch(api + '/jogos').then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(jogos => {
			res.render('criar-post', {jogos: jogos, header: setHeader(usuario.perfil), navclass: {"comunidade": "active"}, "user": usuario, css: selectedCSS});
		})
    } catch (error) {
        console.error('Erro:', error);
		const userId = user.id;
    	res.redirect(`/`); // Redireciona para a home
    }
})

app.get('/add-produto', async (req, res) => {
	const userId = req.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }		

		const { usuario } = await perfilResponse.json(); 

		fetch(api + '/jogos').then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(jogos => {
			res.render('add-produto', {jogos: jogos, header: setHeader(usuario.perfil), navclass: {"meus-produtos": "active"}, "user": usuario, css: selectedCSS});
		})
    } catch (error) {
		console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
	}
})

app.get('/adm', async (req, res) => {
	const userId = req.user;
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
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }		

		const { usuario } = await perfilResponse.json(); 

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
			res.render('adm', {header: setHeader(usuario.perfil), navclass: {"adm": "active"}, "user": usuario, css: selectedCSS});
		}
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
    }	
})

app.get('/editar-usuario/:id', async (req, res) => {
	const userToChangeId = req.params.id;
	const userId = req.user; 
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }		

		const { usuario } = await perfilResponse.json(); 

		fetch(api + '/usuarios?id=' + userToChangeId).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(userToChange => {
			res.render('editar-usuario', {header: setHeader(usuario.perfil), navclass: {"adm": "active"}, usuarios:userToChange, "user": usuario, css: selectedCSS});
		})
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
    }
})

app.get('/editar-jogo/:id', async (req, res) => {
	const jogoId = req.params.id;
	const userId = req.user;
	let jogo;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }	
		
		const { usuario } = await perfilResponse.json(); // Captura o userId da resposta

		fetch(api + '/jogos?id=' + jogoId).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			var a = response.json();
			return a;
		})
		.then(jogo => {
			res.render('editar-jogo', {jogo: jogo, header: setHeader(usuario.perfil), navclass: {"adm": "active"}, "user": usuario, css: selectedCSS});
		})
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
    }
})

app.get('/criar-jogo', async (req, res) => {
	const userId = req.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/adm2.css' : '/css/adm.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

        // Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil-adm', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho, se necessário
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }
		
		const { usuario } = await perfilResponse.json(); // Captura o userId da resposta

		res.render('criar-jogo', {header: setHeader(usuario.perfil), navclass: {"adm": "active"}, "user": usuario, css: selectedCSS});
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
    }
})

app.get('/perfil', async (req, res) => {
	const userId = req.user;
	const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
	const cookies = req.headers.cookie;

	try {
        if(userId == undefined){
			throw new Error('Token inválido'); // Caso o token não seja válido
		}

		// Verifica o perfil na API
        const perfilResponse = await fetch(api + '/verificar-perfil', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookies,
                'User-ID': userId // Enviando o userId no cabeçalho
            }
        });

        if (!perfilResponse.ok) {
            throw new Error('Perfil inválido'); // Caso o perfil não seja válido
        }

        const { usuario } = await perfilResponse.json(); 

		res.render('perfil', {usuario: usuario, header: setHeader(usuario.perfil), navclass: {}, "user": usuario, css: selectedCSS});
    } catch (error) {
        console.error('Erro:', error);
    	res.redirect(`/`); // Redireciona para a home
	}
})

app.get('/editar-senha', async (req, res) => {
    const theme = req.cookies.theme || 'light'; 
    const selectedCSS = theme === 'dark' ? '/css/produtos2.css' : '/css/produtos.css';
    const username = req.query.username;

    if (!username) {
        return res.redirect('/esquecer-senha?erro=usuario-nao-encontrado');
    }

	try {
        // Faz a requisição à API para obter os dados do usuário
        const userResponse = await fetch(api + '/verificar-usuario', {
			method: 'GET',
			headers: {
				'username': username
			}
		});
	
		if (!userResponse.ok) { // Verifique se a resposta não é OK
			console.log('Erro ao buscar usuário:', await userResponse.text()); // Verifique a resposta
			throw new Error('Usuário não encontrado');
		}
	
		const { usuario } = await userResponse.json();

        // Renderiza a view de editar senha com os dados do usuário
        res.render('editar-senha', {usuario: usuario, header: setHeader("visitante"), navclass: {}, "user": usuario, css: selectedCSS});
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.redirect('/esquecer-senha?erro=usuario-nao-encontrado');
    }
});

app.listen(port, function () {
	console.log(`Server listening on port ${port}`);
})

function setHeader(perfil) {
    let header;
    switch (perfil) {
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