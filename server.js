const fs = require('fs');
const path = require('path');
const port = 8083;
const express = require('express');
const app = express() 
app.use(express.static('public'));
app.set('view engine', 'ejs');
const expressLayouts = require('express-ejs-layouts'); 
app.use(expressLayouts) 

app.get('/teste', (req, res) => {
	const jogos_dir = "data/jogos/dados.json";
	const users_dir = "data/users/dados.json";
	var data = fs.readFileSync(users_dir , "utf8");
	var users = JSON.parse(data); 

	console.log(users["usuarios"][1]);
	fs.readFile(jogos_dir , "utf8", function(err, data){
		if(err){
		  return console.log("Erro ao ler arquivo");
		}
		
		var jsonData = JSON.parse(data); 

	   console.log(jsonData["jogos"][0]);
	   res.render('index', {jogos: jsonData["jogos"], header: "headers/default-header.ejs", navclass: {"produtos": "active"}, "user": users["usuarios"][1], css: "/css/produtos2.css"});
	  });
})

app.listen(port, function () {
	console.log(`Server listening on port ${port}`);
})