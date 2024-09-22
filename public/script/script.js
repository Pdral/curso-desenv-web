document.addEventListener('DOMContentLoaded', () => {
    // Função para adicionar funcionalidade de 'like'
    function setupLikeButtons() {
        const likeButtons = document.querySelectorAll('.like');
        likeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('active');
            });
        });
    }

    // Função para exibir o menu de filtro
    function setupDropdown() {
        const filterButton = document.getElementById('filterButton');
        const dropdownContent = document.getElementById('dropdownContent');

        if (filterButton && dropdownContent) {
            filterButton.addEventListener('click', () => {
                console.log('Filter button clicked'); // Verifique se a função é chamada
                if (dropdownContent.style.display === 'block') {
                    dropdownContent.style.display = 'none';
                } else {
                    dropdownContent.style.display = 'block';
                }
            });

            // Fechar o menu se clicar fora dele
            document.addEventListener('click', (event) => {
                if (!filterButton.contains(event.target) && !dropdownContent.contains(event.target)) {
                    console.log('Clicked outside the dropdown'); // Verifique se o clique fora está funcionando
                    dropdownContent.style.display = 'none';
                }
            });
        }
    }

    // Função para abrir o chat
    function setupChat() {
        const chatIcon = document.querySelector('.chat-icon');
        const closeChat = document.getElementById('closeChat');
        const chatWindow = document.getElementById('chatWindow');
    
        if (chatIcon) {
            chatIcon.addEventListener('click', () => {
                if (chatWindow) {
                    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
                }
            });
        }
    
        if (closeChat) {
            closeChat.addEventListener('click', () => {
                if (chatWindow) {
                    chatWindow.style.display = 'none';
                }
            });
        }
    }

    // Função para aplicar o tamanho da fonte ao carregar a página
    function applyFontSize() {
        const fontSize = getCookie('fontSize');
        if (fontSize) {
            applyFontSizeToAllElements(fontSize);
        }
    }

    // Função para aumentar o tamanho da fonte
    function increaseFontSize() {
        let currentSize = parseInt(window.getComputedStyle(document.body).fontSize);
        currentSize += 2;
        applyFontSizeToAllElements(currentSize + 'px');
        setCookie('fontSize', currentSize + 'px', 365); // Salva o tamanho da fonte por 365 dias
    }

    // Função para diminuir o tamanho da fonte
    function decreaseFontSize() {
        let currentSize = parseInt(window.getComputedStyle(document.body).fontSize);
        currentSize -= 2;
        applyFontSizeToAllElements(currentSize + 'px');
        setCookie('fontSize', currentSize + 'px', 365); 
    }

    // Função para aplicar o tamanho da fonte a todos os elementos
    function applyFontSizeToAllElements(fontSize) {
        document.body.style.fontSize = fontSize;
        const elements = document.querySelectorAll('button, a, input, textarea, option, select, p, h1, h2, h3');
        elements.forEach(element => {
            element.style.fontSize = fontSize;
        });
    }

    // Função para definir um cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    // Função para obter um cookie pelo nome
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

     // Adiciona funcionalidade aos botões A+ e A-
     const increaseButton = document.getElementById('increaseFont');
     const decreaseButton = document.getElementById('decreaseFont');
 
     if (increaseButton) {
         increaseButton.addEventListener('click', increaseFontSize);
     }
 
     if (decreaseButton) {
         decreaseButton.addEventListener('click', decreaseFontSize);
     }

     
    // Adiciona eventos para todos os elementos com a classe 'theme-switch'
    document.querySelectorAll('.theme-switch').forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault(); // Impede a navegação padrão do link ou o comportamento padrão do botão
            const newTheme = event.currentTarget.getAttribute('data-theme');
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            if (newTheme !== currentTheme) {
                document.body.classList.toggle('dark-mode');
                setCookie('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light', 365);
                // Recarrega a página para aplicar o CSS correto
                window.location.reload();
            }
        });
    });

    // Verifica e aplica o tema ao carregar a página
    window.onload = function() {
        const theme = getCookie('theme') || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    if (window.location.pathname.includes('/comunidade')) {
        configurarLinksNickname();
    }
    
    // Chama as funções para configurar as funcionalidades
    setupLikeButtons();
    setupDropdown();
    setupChat();
    applyFontSize();
});

function createPost() {
    // Função para Criar post
    // Verifique se estamos na página decriar post
    if (window.location.pathname !== '/criar-post') {
        return undefined;
    }
    const form = document.getElementById('f2');
    
    // Adicione o campo user ao formulário
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Obtém os dados do formulário
        const formData = new FormData(form);
        formData.append('user', user);

        // Cria uma requisição POST
        fetch('http://localhost:8084/criar-post', {
            method: 'POST',
            body: new URLSearchParams(formData) // Converte FormData para URLSearchParams
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar post: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Post criado com sucesso:', data);
            window.location.href = '/comunidade?user=' + user; // Exemplo: redirecionar para a página da comunidade
        })
        .catch(error => {
            console.error('Erro ao criar post:', error);
        });
    });
}

function editarUsuario() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    const userId = window.location.pathname.split("/editar-usuario/").at(-1);

    const moedas = document.getElementById('moedas').value.split(" ")[1];
    
    fetch('http://localhost:8084/usuarios?id=' + userId)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao criar post: ' + response.statusText);
        }
        return response.json();
    })
    .then(usuario => {
        usuario['moedas'] = moedas;
        fetch('http://localhost:8084/usuarios?id=' + userId, {
            method: 'PUT', 
            body: JSON.stringify(usuario)
        })
        .then(response => {
            window.location.href = '/adm?user=' + user; 
        })
        .catch(error => {
            console.error(error);
        });
    })
    .catch(error => {
        console.error(error);
    });
}

function excluirUsuario() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    const userId = window.location.pathname.split("/editar-usuario/").at(-1);

    const url = 'http://localhost:8084/usuarios?id=' + userId;

    fetch(url, {method: 'DELETE'}).then(response => {
        window.location.href = '/adm?user=' + user;
    }).catch(error => {
        console.error(error);
    });
    
}

function criarJogo() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    const nome = document.getElementById('nome').value;

    const url = 'http://localhost:8084/jogos';

    jogo = {
        nome: nome,
        cartas: []
    };

    fetch(url, {
        method: 'POST', 
        body: JSON.stringify(jogo)
    })
    .then(response => {
        window.location.href = '/adm?user=' + user; 
    })
    .catch(error => {
        console.error(error);
    });
    
}

function editarJogo() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    const nome = document.getElementById('nome').value;

    const jogoId = window.location.pathname.split("/editar-jogo/").at(-1);

    const url = 'http://localhost:8084/jogos?id=' + jogoId;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao criar post: ' + response.statusText);
        }
        return response.json();
    })
    .then(jogo => {
        jogo['nome'] = nome;
        fetch(url, {
            method: 'PUT', 
            body: JSON.stringify(jogo)
        })
        .then(response => {
            window.location.href = '/adm?user=' + user; 
        })
        .catch(error => {
            console.error(error);
        });
    })
    .catch(error => {
        console.error(error);
    });
    
}

function excluirJogo() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    const jogoId = window.location.pathname.split("/editar-jogo/").at(-1);

    const url = 'http://localhost:8084/jogos?id=' + jogoId;

    fetch(url, {
        method: 'DELETE'
    })
    .then(response => {
        window.location.href = '/adm?user=' + user; 
    })
    .catch(error => {
        console.error(error);
    });
    
}

// function redirectAdm() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const user = urlParams.get('user');

//     const nomeUsuario = document.getElementById('nomeUsuario').value;
//     const nomeJogo = document.getElementById('nomeJogo').value;

//     window.location.href = '/adm?nomeUsuario=' + nomeUsuario + '&nomeJogo=' + nomeJogo + '&user=' + user;
    
// }

// Carrega as cartas na pagina de meus-produtos
function setupCartas() {
    const cartasContainer = document.getElementById('cartas-container');
    const cartasCompradasContainer = document.getElementById('cartas-compradas');
    const cartasVendidasContainer = document.getElementById('cartas-vendidas');
    
    if (cartasContainer) {
        // Extrair o ID da página da URL
        const pathParts = window.location.pathname.split('/');
        const pageId = pathParts[2]; 
        
        // Extrair o ID do usuário dos parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user'); 
        var fetchUrl = '';

        if(pageId == undefined){
            fetchUrl = '/meus-produtos?user=' + userId;
        } else{
            fetchUrl = '/meus-produtos/' + pageId + '?user=' + userId;
        }
        
        // Faz a requisição via Fetch para carregar as cartas usando o ID da página
        fetch(fetchUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
        
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos:', data);  // Verificar os dados recebidos
            cartasContainer.innerHTML = '';  // Limpar conteúdo anterior

            if(pageId == undefined || pageId == userId){
                const botaoAdd = document.createElement('a');
                botaoAdd.classList.add('botao-adicionar');
                botaoAdd.href = '/add-produto?user=' + userId;
                const adddiv = document.createElement('div');
                adddiv.classList.add("botao-adicionar-div");
                botaoAdd.appendChild(adddiv);

                const jogosavenda = document.getElementById('div-a-venda');
                jogosavenda.appendChild(botaoAdd);
            }

            data.cartas.forEach(carta => {
                const prodEditavel = document.createElement('div'); 
                prodEditavel.classList.add('produto-editavel');
                const cartaDiv = document.createElement('div');
                cartaDiv.classList.add('produto');
                cartaDiv.innerHTML = `
                    <img src="${carta.frente}" alt="${carta.nome}" class="carta">
                    <div class="nome">${carta.nome}</div>
                    <div class="preco">Preço: GC$ ${carta.preco}</div>
                `;
                prodEditavel.appendChild(cartaDiv);

                if(pageId == undefined || pageId == userId){
                    const botaoEditar = document.createElement('a');
                    botaoEditar.classList.add('botao-editar');
                    botaoEditar.href = '/editar-produto/' + carta["id"] + '?user=' + userId;
                    prodEditavel.appendChild(botaoEditar);
                }
                
                cartasContainer.appendChild(prodEditavel);
            });
        
            cartasCompradasContainer.innerHTML = '';
            data.cartasCompradas.forEach(carta => {
                const cartaDiv = document.createElement('div');
                cartaDiv.classList.add('produto');
                cartaDiv.innerHTML = `
                    <img src="${carta.img}" alt="${carta.nome}" class="carta">
                    <div class="nome">${carta.nome}</div>
                    <div class="preco">GC$ ${carta.preco}</div>
                `;
                cartasCompradasContainer.appendChild(cartaDiv);
            });
        
            cartasVendidasContainer.innerHTML = '';
            data.cartasVendidas.forEach(carta => {
                const cartaDiv = document.createElement('div');
                cartaDiv.classList.add('produto');
                cartaDiv.innerHTML = `
                    <img src="${carta.img}" alt="${carta.nome}" class="carta">
                    <div class="nome">${carta.nome}</div>
                    <div class="preco">GC$ ${carta.preco}</div>
                `;
                cartasVendidasContainer.appendChild(cartaDiv);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar as cartas:', error);
        });
    }
}

 
function setupUsuarioseJogos() {
    // Verifique se estamos na página de administração
    if (window.location.pathname !== '/adm') {
        return undefined;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); 
    const nomeUsuario = document.getElementById('nomeUsuario').value;
    const nomeJogo = document.getElementById('nomeJogo').value;
    fetch('/adm?nomeUsuario=' + nomeUsuario + '&nomeJogo=' + nomeJogo, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            var a = response.json();
            console.log(a);
            return a;
        })
        .then(data => {
            const jogos = data.jogos;
            const usuarios = data.usuarios;

            console.log('Dados recebidos:', data);  // Verificar os dados recebidos

            // Atualizar o container de usuários
            const usuariosContainer = document.getElementById('usuarios-container');
            usuariosContainer.innerHTML = ''; // Limpar conteúdo existente

            usuarios.forEach(usuario => {
                const usuarioDiv = document.createElement('div');
                usuarioDiv.className = 'editar-usuario';

                const usuarioContent = `
                    <div class="usuario">
                        <img src="${usuario.icon}" alt="Imagem do Usuário">
                        <div class="nickname">${usuario.username}</div>
                        <div class="moedas">GC$ ${usuario.moedas}</div>
                    </div>
                    <a class="botao-editar" href="/editar-usuario/${usuario.id}?user=${userId}"></a>
                `;

                usuarioDiv.innerHTML = usuarioContent;
                usuariosContainer.appendChild(usuarioDiv);
            });

            // Atualizar o container de jogos
            const jogosContainer = document.getElementById('jogos-container');
            jogosContainer.innerHTML = ''; // Limpar conteúdo existente

            jogos.forEach(jogo => {

                const editarJogo = document.createElement('div');
                editarJogo.className = 'editar-jogo';

                const jogoDiv = document.createElement('div');
                jogoDiv.className = 'jogo'; // Adicione uma classe para estilizar jogos

                const jogoContent = `
                    <div class="jogo-info">
                        <div class="jogo-nome">${jogo.nome}</div>
                    </div>
                `;

                jogoDiv.innerHTML = jogoContent;
                editarJogo.appendChild(jogoDiv);

                const botaoEditar = document.createElement('a');
                botaoEditar.classList.add('botao-editar');
                botaoEditar.href = '/editar-jogo/' + jogo["id"] + '?user=' + userId;
                editarJogo.appendChild(botaoEditar);

                
                jogosContainer.appendChild(editarJogo);
            });

            
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
        });
}

function setupJogos(filtro, cartaNome) {
    // Verifique se estamos na página de produtos
    if (window.location.pathname !== '/') {
        return undefined;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); 
    
    if(cartaNome == undefined){
        cartaNome = '';
    } else{
        cartaNome = document.getElementById('cartaNome').value;
    }
    fetch('/?nome=' + filtro + '&cartaNome=' + cartaNome, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            var a = response.json();
            console.log(a);
            return a;
        })
        .then(data => {
            const jogos = data.jogos;

            console.log('Dados recebidos:', data);  // Verificar os dados recebidos

            // Atualizar o container de jogos
            const jogosContainer = document.getElementById('jogos');
            jogosContainer.innerHTML = ''; // Limpar conteúdo existente

            jogos.forEach(jogo => {

                const jogoDiv = document.createElement('div');
                jogoDiv.className = 'jogo';

                const nome = document.createElement('h2');
                nome.textContent = jogo["nome"];
                jogoDiv.appendChild(nome);

                const cartasDiv = document.createElement('div');
                cartasDiv.className = 'cartas';

                jogo["cartas"].forEach(carta => {
                    const produtoDiv = document.createElement('div');
                    produtoDiv.className = 'produto';

                    const produtoLink = document.createElement('a');
                    produtoLink.href = '/produto/' + carta["id"] + '?user=' + userId;

                    const produtoImg = document.createElement('img');
                    produtoImg.className = 'carta';
                    produtoImg.src = carta["frente"];
                    produtoImg.alt = "Carta";

                    produtoLink.appendChild(produtoImg);
                    produtoDiv.appendChild(produtoLink);

                    const cartaNome = document.createElement('div');
                    cartaNome.className = 'nome';
                    cartaNome.textContent = carta["nome"];
                    produtoDiv.appendChild(cartaNome);

                    const cartaPreco = document.createElement('div');
                    cartaPreco.className = 'preco';
                    cartaPreco.textContent = 'GC$ ' + carta["preco"];
                    produtoDiv.appendChild(cartaPreco);

                    cartasDiv.appendChild(produtoDiv);
                })

                jogoDiv.appendChild(cartasDiv);

                jogosContainer.appendChild(jogoDiv);
            });

            
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
        });
}

function filtraPosts(filtro){
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    window.location.href = '/comunidade?user=' + userId + '&jogo=' + filtro;
}

function filtraPostsTitulo(){
    const filtro = document.getElementById('titulo').value;
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    window.location.href = '/comunidade?user=' + userId + '&titulo=' + filtro;
}

function createComentario() {
    if (!window.location.pathname.includes('/post')) {
        return;
    }

    const form = document.getElementById('comentar');
    
    // Obtém o ID do usuário da URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); // Deve ser uma string ou número, não um objeto

    // Extrai o ID do post da URL
    const pathParts = window.location.pathname.split('/');
    const postId = pathParts[2]; 

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Obtém os dados do formulário
        const formData = new FormData(form);

        // Cria uma requisição POST para adicionar o comentário ao post com o ID específico
        fetch(`http://localhost:8084/post/${postId}`, {
            method: 'POST',
            body: new URLSearchParams(formData) // Converte FormData para URLSearchParams
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar comentário: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Comentário criado com sucesso:', data);
            window.location.href = '/post/' + postId + '?user=' + userId; // Redireciona para a página do post atualizado
        })
        .catch(error => {
            console.error('Erro ao criar comentário:', error);
        });
    });
}

function redirecionarAoCriarCarta(){
    if (!window.location.pathname.includes('/add-produto')) {
        return;
    }

    const form = document.getElementById('add-produto-form');
    
    // Obtém o ID do usuário da URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); // Deve ser uma string ou número, não um objeto

    document.getElementById('frente-input').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Obtém o arquivo selecionado
        const reader = new FileReader();

        reader.onload = function(e) {
            const imagemPrevia = document.getElementById('frente');
            imagemPrevia.src = e.target.result; // Define a fonte da imagem
        };

        if (file) {
            reader.readAsDataURL(file); // Lê o arquivo como URL
        }
    });

    document.getElementById('verso-input').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Obtém o arquivo selecionado
        const reader = new FileReader();

        reader.onload = function(e) {
            const imagemPrevia = document.getElementById('verso');
            imagemPrevia.src = e.target.result; // Define a fonte da imagem
        };

        if (file) {
            reader.readAsDataURL(file); // Lê o arquivo como URL
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Obtém os dados do formulário
        const formData = new FormData(form);

        // Cria uma requisição POST para adicionar o comentário ao post com o ID específico
        fetch(`http://localhost:8084/cartas`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar carta: ' + response.statusText);
            }
            window.location.href = '/meus-produtos?user=' + userId;
        })
        .catch(error => {
            console.error('Erro ao criar carta:', error);
        });
    });
}

function redirecionarAoAtualizarCarta(){
    if (!window.location.pathname.includes('/editar-produto')) {
        return;
    }

    const form = document.getElementById('edit-produto-form');
    
    // Obtém o ID do usuário da URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); // Deve ser uma string ou número, não um objeto

    document.getElementById('frente-input').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Obtém o arquivo selecionado
        const reader = new FileReader();

        reader.onload = function(e) {
            const imagemPrevia = document.getElementById('frente');
            imagemPrevia.src = e.target.result; // Define a fonte da imagem
        };

        if (file) {
            reader.readAsDataURL(file); // Lê o arquivo como URL
        }
    });

    document.getElementById('verso-input').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Obtém o arquivo selecionado
        const reader = new FileReader();

        reader.onload = function(e) {
            const imagemPrevia = document.getElementById('verso');
            imagemPrevia.src = e.target.result; // Define a fonte da imagem
        };

        if (file) {
            reader.readAsDataURL(file); // Lê o arquivo como URL
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Obtém os dados do formulário
        const formData = new FormData(form);
        const pathParts = window.location.pathname.split('/');
        const pageId = pathParts[2]; 

        // Cria uma requisição POST para adicionar o comentário ao post com o ID específico
        fetch(`http://localhost:8084/cartas?id=` + pageId, {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar carta: ' + response.statusText);
            }
            window.location.href = '/meus-produtos?user=' + userId;
        })
        .catch(error => {
            console.error('Erro ao criar carta:', error);
        });
    });
}

function excluirCarta(){
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); // Deve ser uma string ou número, não um objeto
    const pathParts = window.location.pathname.split('/');
    const pageId = pathParts[2]; 
    fetch(`http://localhost:8084/cartas?id=` + pageId, {
        method: 'DELETE'
    })
    .then(response => {
        window.location.href = '/meus-produtos?user=' + userId;
    })
    .catch(error => {
        console.error('Erro ao criar carta:', error);
    });
}

function upgrade(){
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); 
    fetch(`http://localhost:8084/upgrade?id=` + userId, {
        method: 'POST'
    })
    .then(response => {
        if(response.status === 401){
            const mensagem = document.getElementById('mensagemErro');
            mensagem.textContent = 'Você precisa de 100 moedas para se tornar premium';
            mensagem.style.display = 'flex'; // Exibe a mensagem
        } else{
            window.location.href = '/perfil?user=' + userId;
        }
    })
    .catch(error => {
        console.error(error);
    });
}

function criarUsuario(){
    if (!window.location.pathname.includes('/cadastro')) {
        return;
    }

    const form = document.getElementById('f2');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Obtém os dados do formulário
        const formData = new FormData(form);

        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmar-senha").value;
        const mensagemErro = document.getElementById('mensagemErro');

        if(senha !== confirmarSenha){
            mensagemErro.textContent = 'As senhas não são iguais. Tente novamente.';
        } else{
            var user = {
                "username": formData.get("username"),
                "moedas": "100,00",
                "perfil": "simples",
                "icon": "/img/default.png",
                "cartas-compradas": [],
                "cartas-vendidas": [],
                "senha": senha
            }
            fetch(`http://localhost:8084/usuarios`, {
                method: 'POST',
                body: JSON.stringify(user)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao criar user: ' + response.statusText);
                }
                return response.json();
            })
            .then(id => {
                this.submit();
            })
            .catch(error => {
                console.error('Erro ao criar carta:', error);
            });
        }
    });
}

function editarPerfilUsuario(){
    if (!window.location.pathname.includes('/perfil')) {
        return;
    }
    
    // Obtém o ID do usuário da URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); // Deve ser uma string ou número, não um objeto

    const form = document.getElementById('perfil-form');

    document.getElementById('icon-input').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Obtém o arquivo selecionado
        const reader = new FileReader();

        reader.onload = function(e) {
            const imagemPrevia = document.getElementById('icon-img');
            imagemPrevia.src = e.target.result; // Define a fonte da imagem
        };

        if (file) {
            reader.readAsDataURL(file); // Lê o arquivo como URL
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Obtém os dados do formulário
        const formData = new FormData(form);
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        fetch('http://localhost:8084/updateUsuario?id=' + userId, {
            method: 'PUT', 
            body: formData
        })
        .then(response => {
            window.location.href = '/?user=' + userId; 
        })
        .catch(error => {
            console.error(error);
        });
    });
}

let socket;
let isChatOpen = false; // Variável para controlar se o chat está aberto

function configurarLinksNickname() {
    if (!window.location.pathname.includes('/comunidade')) {
        return;
    }

    const nicknameLinks = document.querySelectorAll('span.nickname');
    const chatWindowUsuario = document.getElementById('chatWindowUsuario');
    const closeChatUsuario = document.getElementById('closeChatUsuario');
    let receiverIdAtual = null; // Variável para armazenar o receiverId atual

    // Função para fechar o WebSocket
    function fecharWebSocket() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
            console.log('Conexão WebSocket fechada');
        }
    }

    // Função para fechar o chat
    function fecharChat() {
        fecharWebSocket();
        chatWindowUsuario.style.display = 'none';
        isChatOpen = false;
    }

    // Fechar chat ao clicar no botão de fechar
    closeChatUsuario.addEventListener('click', fecharChat);

    // Configurar os links de nickname
    nicknameLinks.forEach(span => {
        span.addEventListener('click', (event) => {
            event.preventDefault();
            receiverIdAtual = span.getAttribute('data-receiver-id');
            const receiverName = span.textContent.trim(); 
            console.log('Receiver', receiverIdAtual)

            // Atualiza o chatUsername
            document.getElementById('chatUsername').textContent = receiverName;

            // Carregar mensagens antigas
            carregarMensagensAntigas(receiverIdAtual);

            // Exibir a janela de chat
            chatWindowUsuario.style.display = 'block';
            isChatOpen = true; // Marcar que o chat está aberto

            // Fechar qualquer conexão WebSocket anterior
            fecharWebSocket();

            // Criar o WebSocket após o clique em um nome de usuário
            socket = new WebSocket('ws://localhost:8084');

            socket.onopen = function() {
                console.log('Conectado ao WebSocket com o usuário', receiverIdAtual);
            };

            socket.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                console.log('Mensagem recebida:', messageData);
                exibirMensagem(messageData); // Função para exibir as mensagens recebidas no chat
            };

            socket.onclose = function() {
                console.log('Conexão WebSocket fechada');
            };

            // Listener para envio do formulário, associado ao receiverId atual
            document.getElementById('enviarMessagem').addEventListener('submit', function(event) {
                event.preventDefault();
                criarMensagem(receiverIdAtual);
            });
        });
    });
}

// Função para carregar mensagens antigas
function carregarMensagensAntigas(receiverId) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');

    fetch(`http://localhost:8084/chat/history?user=${userId}&receiver=${receiverId}`)
        .then(response => response.json()) 
        .then(data => {
            const chatMessagesUsuario = document.getElementById('chatMessagesUsuario');
            chatMessagesUsuario.innerHTML = ''; // Limpa mensagens anteriores

            // Adiciona todas as mensagens ao chat
            data.messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.innerHTML = `
                    <img src="${msg.icon}" alt="Imagem do Usuário" class="user-icon">
                    <span><strong>${msg.username}:</strong> ${msg.message}</span>
                `;
                chatMessagesUsuario.appendChild(messageElement);
            });
        })
        .catch(error => console.error('Erro ao carregar mensagens:', error));
}

// Função para enviar mensagem
function criarMensagem(receiverId) {
    const form = document.getElementById('enviarMessagem');
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    console.log('REceiver Id', receiverId);

    const messageInput = document.getElementById('messageInput').value;

    if (!messageInput) {
        console.error('Mensagem vazia não pode ser enviada');
        return;
    }
            const userIcon = '/img/porco.png';
            const username = 'Teste';

            const messageData = {
                sender: userId,
                receiver: receiverId,
                content: messageInput,
                icon: userIcon,
                username: username
            };

            console.log('Id do receiver', receiverId);

            // Verifica se o WebSocket está aberto
            if (socket && socket.readyState === WebSocket.OPEN) {                
                socket.send(JSON.stringify(messageData));
                document.getElementById('messageInput').value = ''; // Limpa o campo de entrada
            } else {
                console.error('WebSocket não está aberto. Mensagem não enviada.');
            }
}

// Função para exibir mensagem
function exibirMensagem(data) {
    const chatMessagesUsuario = document.getElementById('chatMessagesUsuario');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <img src="${data.icon}" alt="Imagem do Usuário" class="user-icon">
        <span><strong>${data.username}:</strong> ${data.content}</span>
    `;
    chatMessagesUsuario.appendChild(messageElement);
}

function comprarCarta(){
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user'); // Deve ser uma string ou número, não um objeto
    console.log(userId);
    if(userId == null || userId == undefined || userId == "" || userId == "null"){
        window.location.href = '/login';
    }else {
        const pathParts = window.location.pathname.split('/');
        const pageId = pathParts[2]; 
        fetch(`http://localhost:8084/comprarCarta`, {
            method: 'POST',
            body: JSON.stringify({
                user: userId,
                carta: pageId
            })
        })
        .then(response => {
            if(response.status === 401){
                const mensagem = document.getElementById('mensagem');
                mensagem.textContent = 'Você não possui moedas suficientes';
                mensagem.style.display = 'flex'; // Exibe a mensagem
            } else{
                window.location.href = '/meus-produtos?user=' + userId;
            }
        })
        .catch(error => {
            console.error('Erro ao criar carta:', error);
        });
    }
}

setupCartas();
setupUsuarioseJogos();
setupJogos("");
createPost();
createComentario();
redirecionarAoCriarCarta();
redirecionarAoAtualizarCarta();
criarUsuario();
editarPerfilUsuario();