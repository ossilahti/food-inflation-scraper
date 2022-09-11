import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();
app.use(cors());
dotenv.config();

export class MilkPrices {
    constructor() {
        this.url = 'https://www.s-kaupat.fi/tuote/valio-vapaan-lehman-kevytmaito-1-l/6408430000128';
    }

    start() {
        app.get('/', function (req, res) {
            res.json('This is a test');
        });
    };

    getPriceFromSKaupat() {
        app.get('/results', (req, res) => {
            axios(this.url)
                .then(response => {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    const products = [];
        
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
        });
    }

    activate() {
        this.start();
        this.getPriceFromSKaupat();
    }
}

function activateViewModel() {
    app.listen(process.env.PORT, () => console.log(`server running on PORT ${process.env.PORT}`));
    const milkPrices = new MilkPrices();
    milkPrices.activate();
}

activateViewModel();
