import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
const { readFileSync, writeFileSync } = require('fs');
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const app = express();
app.use(cors());

interface UrlArray<T> {
    readonly [n: string]: T;
}

class Products {
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
     * @returns Object array of title and price - returns it in json to server
     */
    async fetchPriceData(url: any) {
        const response = await this.getDetails(url);
        let priceDetails: { title: string, price: string, date: string } [] = [];
        const $ = cheerio.load(response);
        $('.sc-76652cbd-2', response).each((i) => { 
            priceDetails[0] = {
                title: $('.sc-618c7756-0').text(),
                price: $('.sc-d1a120d4-0').text(),
                date: this.getDate()
            };
        });

        console.log(chalk.cyan(priceDetails[0].title));
        return priceDetails[0];
    }

    /**
     * Fetches milk price from html and saves it to a .json-file
     */
    onSave(products: any, urls: any) {
        let i = 0;
        for (const [key, value] of Object.entries(urls)) {
            this.writeToFile(`data/${key}.json`, products[i]);
            i++;
        }
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
     * @param data Data which is saved
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
        const urls: UrlArray<string> = {
            milk: 'https://www.s-kaupat.fi/tuote/valio-vapaan-lehman-kevytmaito-1-l/6408430000128',
            cheese: 'https://www.s-kaupat.fi/tuote/valio-oltermannir-17-e900-g/6408430039517',
            butter: 'https://www.s-kaupat.fi/tuote/valio-oivariinir-550-g-vaharasvaisempi-valsar-hylar/6408430310890',
            bread: 'https://www.s-kaupat.fi/tuote/vaasan-ruispalat-330-g-6-kpl-revitty-taysjyvaruisleipa/6437005003752',
            rice: 'https://www.s-kaupat.fi/tuote/risella-jasmiiniriisi-1kg/8410184027809',
            chicken: 'https://www.s-kaupat.fi/tuote/kariniemen-kananpojan-fileesuikale-hunaja-450-g/6407720025070',
            meat: 'https://www.s-kaupat.fi/tuote/atria-parempi-nauta-jauheliha-10-400g/6407840041172',
        };

        const products: any = [];
        console.log('Saved prices of the following products:');

        for (const [key, value] of Object.entries(urls)) {
            products.push(await this.fetchPriceData(value))
        }

        this.onSave(products, urls);
        console.log(chalk.green('Successfully saved to a file.'))
    }
}

function activateViewModel() {
    const priceClass = new Products();
    priceClass.activate();
}

activateViewModel();