import { MongoClient } from 'mongodb';

//exportando o modo de conexão
export const Mongo = {
    async connect({mongoConnectionString, mongodbName}) {
        //função de importação e exportação
        try {
            const client = new MongoClient(mongoConnectionString);

            await client.connect();

            //constante para indicar o db
            const db = client.db(mongodbName);

            //características dos objs dentro do db
            this.client = client;
            this.db = db;

            //mensagem de sucesso
            return { text: 'Connected to mongo', error: null };

        } catch (error) {
            return { text: 'Error during mongo connection', error };
        }



    }
}