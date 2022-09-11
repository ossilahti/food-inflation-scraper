import axios from 'axios';
import cheerio from 'cheerio';
import dotenv from 'dotenv';
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
dotenv.config();

export class Prices {
    milkUrl: string;
    cheeseUrl: string;
    constructor() {
        this.milkUrl = 'https://www.s-kaupat.fi/tuote/valio-vapaan-lehman-kevytmaito-1-l/6408430000128';
        this.cheeseUrl = 'https://www.s-kaupat.fi/tuote/valio-oltermannir-17-e900-g/6408430039517';
    }

    async getDetails(url: any) {
        const response = await axios.get(url);
        return response.data;
    }

    getMilkPrice() {
        app.get('/milk', async (req: any, res: any) => {
            const response = await this.getDetails(this.milkUrl);
            const $ = cheerio.load(response);
            let products: { title: string, price: string} [] = [];
            
            $('.ant-row', response).each((i) => { 
                products[0] = {
                    title: $('.sc-618c7756-0').text(),
                    price: $('.sc-d1a120d4-0').text()
                };
            });

            res.json(products);
        });
    }

    getCheesePrice() {
        app.get('/cheese', async (req: any, res: any) => {
            const response = await this.getDetails(this.cheeseUrl);
            const $ = cheerio.load(response);
            let cheeses: { title: string, price: string} [] = [];

            $('.sc-76652cbd-2', response).each(() => {
                cheeses[0] = {
                    title: $('.sc-618c7756-0').text(),
                    price: $('.sc-d1a120d4-0').text()
                };
            });
            
            res.json(cheeses);
        });
    }

    activate() {
        this.getMilkPrice();
        this.getCheesePrice();
    }
}

function activateViewModel() {
    app.listen(process.env.PORT, () => console.log(`server running on PORT ${process.env.PORT}`));
    const sRyhma = new Prices();
    sRyhma.activate();
}

activateViewModel();
