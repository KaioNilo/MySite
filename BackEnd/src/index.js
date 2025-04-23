import express from "express";
import cors from "cors";
import { Mongo } from "./database/mongo.js";
import { config } from "dotenv";
import authRouter from "./auth/auth.js";

//rodando o dotenv
config();

async function main() {
    const hostname = 'localhost';
    const port = 3000;

    //criação do app
    const app = express();

    //conexão com o db
    const mongoConnection = await Mongo.connect({
        mongoConnectionString: process.env.MONGO_CS, mongodbName: process.env.MONGO_DB_NAME
    }); 
    console.log(mongoConnection);



    //organiza a resposta do servidor
    app.use(express.json());
    app.use(cors());

    //criação da busca
    app.get('/', (req, res) => {
        res.send({
            sucess: true,
            statusCode: 200,
            body: "Welcome to MySite"
        });
    });

    //rota para a autenticação
    app.use('/auth', authRouter);
    
    //definição para rodar o app
    app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });

}

main();