import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
    });
const port = process.env.PORT || 3001;    
app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
    });