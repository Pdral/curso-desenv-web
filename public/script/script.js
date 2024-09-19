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

    // Função para enviar um comentário
    function setupCommentForm() {
        const submitCommentButton = document.getElementById('submit-comment');
        if (submitCommentButton) {
            submitCommentButton.addEventListener('click', () => {
                const commentInput = document.getElementById('comment-input');
                const commentText = commentInput.value;

                if (commentText.trim() !== "") {
                    const comment = document.createElement('div');
                    comment.classList.add('comment');
                    comment.innerHTML = `<p>${commentText}</p>`;

                    const commentsSection = document.getElementById('comments');
                    if (commentsSection) {
                        commentsSection.appendChild(comment);
                    }
                    commentInput.value = "";
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
    
    // Chama as funções para configurar as funcionalidades
    setupLikeButtons();
    setupDropdown();
    setupChat();
    setupCommentForm();
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
            // Opcional: redirecionar para outra página ou atualizar a interface
            window.location.href = '/comunidade?user=' + user; // Exemplo: redirecionar para a página da comunidade
        })
        .catch(error => {
            console.error('Erro ao criar post:', error);
        });
    });
}

function editarUsuario() {
    // const form = document.getElementById('form');
    
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    const userId = window.location.pathname.split("/editar-usuario/").at(-1);

    // const formData = new FormData(form);
    // console.log(formData);

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
                    <div class="preco">Preço: R$ ${carta.preco}</div>
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
                    cartaPreco.textContent = carta["preco"];
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

setupCartas();
setupUsuarioseJogos();
setupJogos("");
createPost();