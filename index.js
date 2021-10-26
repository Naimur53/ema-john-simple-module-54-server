const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

const { MongoClient } = require('mongodb');



// middle wdar
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.icikx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("online_shop");
        const productCollection = database.collection("products");
        const orderCollection = database.collection('order')
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();

            }

            res.json({
                count,
                products
            });
        });

        app.post('/products/byKeys', async (req, res) => {
            console.log('kire', req.body);
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();
            res.send(products)
        })
        // add order api 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('order', order);
            res.send('order processed')
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ema jon server is running');
});

app.listen(port, () => {
    console.log('server is running at port', port);
})