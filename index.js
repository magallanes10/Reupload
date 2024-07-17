const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const cookies = fs.readFileSync('cookies.txt', 'utf8').trim();
const libraryPath = path.join(__dirname, 'library.json');

let library = [];
if (fs.existsSync(libraryPath)) {
    library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
} else {
    fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2));
}

app.get('/jonell/upload', async (req, res) => {
    const { url, author, title } = req.query;

    if (!url || !author || !title) {
        return res.status(400).json({ error: 'Missing url, author, or title' });
    }

    try {
        console.log(`Submitting form with URL: ${url}, Title: ${title}, Author: ${author}`);
        const urlsong = url;

        const fetchFormAndSubmit = async () => {
            try {
                const getResponse = await axios.get('https://geodash.click/dashboard/reupload/songAdd.php', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });

                const $ = cheerio.load(getResponse.data);

                const formData = new URLSearchParams();
                formData.append('url', urlsong);
                formData.append('title', title);
                formData.append('author', author);

                const postResponse = await axios.post('https://geodash.click/dashboard/reupload/songAdd.php', formData.toString(), {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                const $post = cheerio.load(postResponse.data);

                let responseJson = {};

                const successMessage = $post('p:contains("Song Reuploaded:")').text();
                if (successMessage) {
                    const songId = successMessage.match(/Song Reuploaded: (\d+)/)[1];
                    responseJson.songid = songId;
                    // Add to library
                    library.push({ title, author, url: urlsong });
                    fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2));
                } else {
                    const errorMessage = $post('p:contains("An error has occured:")').text();
                    if (errorMessage.includes("-3")) {
                        responseJson.error = "This song has been reuploaded already";
                    } else if (errorMessage.includes("-2")) {
                        responseJson.error = "Invalid URL";
                    } else {
                        responseJson.error = "An unknown error has occurred";
                    }
                }

                return responseJson;
            } catch (error) {
                console.error(error);
                throw error;
            }
        };

        const result = await fetchFormAndSubmit();
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
