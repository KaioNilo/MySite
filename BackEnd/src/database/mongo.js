//biblioteca do MongoDB
import { MongoClient } from 'mongodb';

//exportando o modo de conexão
export const Mongo = {
    async connect({mongoConnectionString, mongodbName}) {
        //Função de importação e exportação
        //Função: tentar (try) ... se der erro, pegar (catch)
        try {
            const client = new MongoClient(mongoConnectionString);

            await client.connect();

            //constante para indicar o db
            const db = client.db(mongodbName);

            //após a conexão, adc esses elementos
            this.client = client;
            this.db = db;

            //mensagem de sucesso
            return { text: 'Connected to mongo', error: null };

        } catch (error) {
            return { text: 'Error during mongo connection', error };
        }

    }
}