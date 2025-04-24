import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import { Mongo } from "../database/mongo.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const collectionName = 'users';

//validação de email e senha para login
passport.use(new LocalStrategy ( { usernameField: "email" }, async (email, password, callback) => {
    
    const user =  await Mongo.db
    
    //busca do email do user
    .collection(collectionName)
    .findOne({ email: email });

    if (!user) {
        return callback(null, false);
    };

    //Salvar a senha e a sua chave de descriptação
    const saltBuffer = user.salt.buffer

    //validação da senha
    crypto.pbkdf2(password, saltBuffer, 310000, 16, 'sha256', (err, hashedPassword) => {
        if (err) {
            return callback(null, false);
        };

        //como o mongodb salva para guardar a criptação
        const userPasswordBuffer = Buffer.from(user.password.buffer);

        //decriptação
        if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
            return callback(null, false);
        }
        
        //criando segurança da senha e do salt
        const { password, salt, ...rest} = user;

        return callback(null, rest);
    })

}));

//criando a rota de autenticação
const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    //verificação se o usuário existe
    const checkUser = await Mongo.db    
    .collection(collectionName)    
    .findOne({ email: req.body.email });

    //caso exista, retornar erro
    if (checkUser) {
        return res.status(500).send({
            success: false,
            statusCode: 500,
            body: {
                text: "User already exists"
            }
        });
    };


    //não existe, faz a criptografia da senha
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 16, 'sha256', async (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: {
                    text: "Error during password encryption",
                    err
                }
            });
        }

        //inserindo o user
        const result = await Mongo.db
        .collection(collectionName)
        .insertOne({
            email: req.body.email,
            password: hashedPassword,
            salt
        });

        //respondendo o "insertedId" do mongodb (resposta que a plataforma dá quando cria um user)
        if (result.insertedId) {
            const user = await Mongo.db
            .collection(collectionName)
            .findOne({ _id: new ObjectId(result.insertedId) });

            //criando o token
            const token = jwt.sign(user, 'secret');

            return res.send({
                success: true,
                statusCode: 200,
                body: {
                    text: "User created",
                    token,
                    user,
                    logged: true
                }
            })
        }

    })
});

//rota de login
authRouter.post('/login', (req, res) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            return res.send({
                success: false,
                statusCode: 500,
                body: {
                    text: "Error during login",
                    err
                }
            });
        }

        if (!user) {
            return res.status(400).send({
                success: false,
                statusCode: 400,
                body: {
                    text: "User not found"
                }
            });
        }

        const token = jwt.sign(user, 'secret');

        return res.status(200).send({
            success: true,
            statusCode: 200,
            body: {
                text: "User logged",
                token,
                user
            }
        });

    }) (req, res);
})



export default authRouter
