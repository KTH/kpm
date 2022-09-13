/* Top-level source file for my-teaching-api */
import { config } from 'dotenv';
config()

import express from 'express';

const app = express();
const port = parseInt(process.env.PORT || '3000');

app.get('/', (req, res) => {
    res.send({msg: 'Hello World!!!'});
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
