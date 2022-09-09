
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())

// Checks milk price from s-kaupat
const url = 'https://www.s-kaupat.fi/tuote/valio-vapaan-lehman-kevytmaito-1-l/6408430000128';

app.get('/', function (req, res) {
    res.json('This is my webscraper')
})

app.get('/results', (req, res) => {
    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const products = []

            $('.ant-row', html).each(function () { //<-- cannot be a function expression
                const title = $('.sc-618c7756-0').text();
                const price = $('.sc-d1a120d4-0').text();
                products.push({
                    title,
                    price
                });
            })
            res.json(products);
        }).catch(err => console.log(err))
})

app.listen(process.env.PORT, () => console.log(`server running on PORT ${process.env.PORT}`))