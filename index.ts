import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
const { readFileSync, writeFileSync } = require('fs');
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const app = express();
app.use(cors());

class Products {
    urlArray: any;
    constructor() {
        this.urlArray = {
            milk: 'https://www.s-kaupat.fi/tuote/valio-vapaan-lehman-kevytmaito-1-l/6408430000128',
            cheese: 'https://www.s-kaupat.fi/tuote/valio-oltermannir-17-e900-g/6408430039517',
            butter: 'https://www.s-kaupat.fi/tuote/valio-oivariinir-550-g-vaharasvaisempi-valsar-hylar/6408430310890',
            bread: 'https://www.s-kaupat.fi/tuote/vaasan-ruispalat-330-g-6-kpl-revitty-taysjyvaruisleipa/6437005003752',
            rice: 'https://www.s-kaupat.fi/tuote/risella-jasmiiniriisi-1kg/8410184027809',
            chicken: '',
            meat: '',
        };
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
     * @param url The url where the data is fetched
     * @param parentClass The parent element in html - under this is found the price details
     * @param titleClass Under this class is the text of the product title
     * @param priceClass Under this class is the text of the product price
     * @returns Object array of title and price - returns it in json to server
     */
    async fetchPriceData(url: string, parentClass: string, titleClass: string, priceClass: string) {
        const response = await this.getDetails(url);
        let priceDetails: { title: string, price: string, date: string } [] = [];
        const $ = cheerio.load(response);
        $(parentClass, response).each((i) => { 
            priceDetails[0] = {
                title: $(titleClass).text(),
                price: $(priceClass).text(),
                date: this.getDate()
            };
        });

        console.log(chalk.cyan(priceDetails[0].title));
        return priceDetails[0];
    }

    /**
     * Fetches milk price from html and saves it to a .json-file
     */
    onSave(arrayOfProducts: any) {
        this.writeToFile('data/milk.json', arrayOfProducts[0]);
        this.writeToFile('data/cheese.json', arrayOfProducts[1]);
        this.writeToFile('data/butter.json', arrayOfProducts[2]);
        this.writeToFile('data/bread.json', arrayOfProducts[3]);
        this.writeToFile('data/rice.json', arrayOfProducts[4]);
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

    /**
     * Saves data to given json file
     * @param file File where the json is saved 
     * @param save Data which is saved
     */
    writeToFile(file: any, data: any) {
        // Read content of file
        const jsonData = readFileSync(file);
        let fileObject = JSON.parse(jsonData);

        // Save new data to the file object
        fileObject.push(data);

        // Write to the file
        const newData = JSON.stringify(fileObject, null, 2);
        writeFileSync(file, newData);
    }

    async activate() {
        console.log('Saved prices of the following products:');
        const milkPrice = await this.fetchPriceData(this.urlArray.milk, '.sc-76652cbd-2', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const cheesePrice = await this.fetchPriceData(this.urlArray.cheese, '.sc-76652cbd-2', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const butterPrice = await this.fetchPriceData(this.urlArray.butter, '.sc-76652cbd-2', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const breadPrice = await this.fetchPriceData(this.urlArray.bread, '.sc-76652cbd-2', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const ricePrice = await this.fetchPriceData(this.urlArray.rice, '.sc-76652cbd-2', '.sc-618c7756-0', '.sc-d1a120d4-0');
        const arrayOfProducts = [ milkPrice, cheesePrice, butterPrice, breadPrice, ricePrice ];
        this.onSave(arrayOfProducts);
        console.log(chalk.green('Successfully saved to a file.'))
    }
}

function activateViewModel() {
    const priceClass = new Products();
    priceClass.activate();
}

activateViewModel();