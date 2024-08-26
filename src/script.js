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

    // Chama as funções para configurar as funcionalidades
    setupLikeButtons();
    setupDropdown();
    setupChat();
    setupCommentForm();
    
});