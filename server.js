const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8083;

http.createServer(function (req, res) {
    const u = new URL(req.url, `http://${req.headers.host}`);
    const extname = path.extname(u.pathname);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
        case '.woff':
        case '.woff2':
            contentType = 'application/font-woff';
            break;
        case '.ttf':
            contentType = 'application/font-ttf';
            break;
        case '.eot':
            contentType = 'application/vnd.ms-fontobject';
            break;
        case '.otf':
            contentType = 'application/font-otf';
            break;
        case '.svg':
            contentType = 'application/image/svg+xml';
            break;
    }

    if (extname) {
        // Path to the file requested
        const filePath = path.join(__dirname, u.pathname);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end("<h1>404 File Not Found</h1>");
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data, 'utf-8');
        });
    } else {
        switch (u.pathname) {
            //----------------------------------------------------------------- GET
            case '/':
                fs.readFile("public/index.html", (err, data) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/cadastro':
                fs.readFile("public/cadastro.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/cadastro-dark':
                fs.readFile("public/cadastro-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/login':
                fs.readFile("public/login.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/login-dark':
                fs.readFile("public/login-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/esquecer-senha':
                fs.readFile("public/esquecersenha.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/esquecer-senha-dark':
                fs.readFile("public/esquecersenha-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            //case '/form':
                //res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                //res.write("<h2> Os dados que você enviou foram: </h2>");
                //const param = u.searchParams;
                //res.write("<p> nome: " + param.get("nome") + "</p>");
                //res.write("<p> senha: " + param.get("senha") + "</p>");
                //const ad = param.get("add");
                //ad ? res.write("<p> add: " + ad + "</p>") : null;
                //res.end();
                //break;

            case '/comunidade':
                fs.readFile("public/comunidade.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;
                
            case '/comunidade-dark':
                fs.readFile("public/comunidade-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/post':
                fs.readFile("public/post.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/post-dark':
                fs.readFile("public/post-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/dark':
                fs.readFile("public/index-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/meus-produtos':
                fs.readFile("public/meus-produtos.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/meus-produtos-dark':
            fs.readFile("public/meus-produtos-dark.html", (err, data) => {
                if (err) {
                    console.log(`Error reading file: ${err.message}`);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return res.end("<h1>404 File Not Found</h1>");
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(data);
                return res.end();
            });
            break;

            case '/editar-produto':
                fs.readFile("public/editar-produto.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/editar-produto-dark':
                fs.readFile("public/editar-produto-dark.html", (err, data) => {
                if (err) {
                    console.log(`Error reading file: ${err.message}`);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return res.end("<h1>404 File Not Found</h1>");
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(data);
                return res.end();
            });
            break;

            case '/produto':
                fs.readFile("public/produto.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/produto-dark':
                fs.readFile("public/produto-dark.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/criar-post':
                fs.readFile("public/criar-post.html", (err, data) => {
                    if (err) {
                        console.log(`Error reading file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        return res.end("<h1>404 File Not Found</h1>");
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(data);
                    return res.end();
                });
                break;

            case '/criar-post-dark':
            fs.readFile("public/criar-post-dark.html", (err, data) => {
                if (err) {
                    console.log(`Error reading file: ${err.message}`);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return res.end("<h1>404 File Not Found</h1>");
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(data);
                return res.end();
            });
            break;

            //----------------------------------------------------------------- Outros recursos

            case '/favicon.ico':
                res.writeHead(204, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end();

            default:
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(`<h1> O recurso ${u.pathname} é desconhecido.</h1>`);
                res.end();
        }
    }
}).listen (port, () => console.log(`Application is running on port ${port}`))