import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
const { appendFile, readFile } = require('fs/promises');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

class Products {
    milkUrl: string;
    cheeseUrl: string;
    constructor() {
        this.milkUrl = 'https://www.s-kaupat.fi/tuote/valio-vapaan-lehman-kevytmaito-1-l/6408430000128';
        this.cheeseUrl = 'https://www.s-kaupat.fi/tuote/valio-oltermannir-17-e900-g/6408430039517';
    }

    /**
     * Gets the html data and makes it readable
     * @param url The url for what product the data is fetched
     * @returns Html data of given url
     */
    async getDetails(url: string) {
        const response = await axios.get(url);
        return response.data;
    }

    /**
     * Iterates through html data by class names
     * @param data The html data
     * @param parentClass The parent element in html - under this is found the price details
     * @param titleClass Under this class is the text of the product title
     * @param priceClass Under this class is the text of the product price
     * @returns Object array of title and price - returns it in json to server
     */
    fetchPriceData(data: any, parentClass: string, titleClass: string, priceClass: string) {
        let priceDetails: { title: string, price: string, date: string } [] = [];
        const $ = cheerio.load(data);
        $(parentClass, data).each((i) => { 
            priceDetails[0] = {
                title: $(titleClass).text(),
                price: $(priceClass).text(),
                date: this.getDate()
            };
        });

        return priceDetails;
    }

    async saveMilkPrice() {
        const response = await this.getDetails(this.milkUrl);
        const milkPrice = this.fetchPriceData(response, '.ant-row', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const jsonData = JSON.stringify(milkPrice, null, 2);
        this.saveData('data/milk.json', jsonData);
    }

    async saveCheesePrice() {
        const response = await this.getDetails(this.cheeseUrl);
        const cheesePrice = this.fetchPriceData(response, '.sc-76652cbd-2', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const jsonData = JSON.stringify(cheesePrice, null, 2);
        this.saveData('data/cheese.json', jsonData);
    }

    /**
     * Gets today's date
     * @returns Finnish-formatted date
     */
    getDate() {
        let date = new Date(); 
        let formattedDate = (moment(date)).format('D.M.YYYY'); // Finnish format
        return formattedDate; 
    }

    saveData(file: any, data: any) {
        appendFile(file, data, () => {});
    }

    activate() {
        this.saveMilkPrice();
        this.saveCheesePrice();
    }
}

function activateViewModel() {
    const priceClass = new Products();
    priceClass.activate();
}

activateViewModel();