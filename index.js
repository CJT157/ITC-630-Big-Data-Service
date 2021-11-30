const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = 3001;

require('dotenv').config();
const BigQuery = require('@google-cloud/bigquery');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
    performQuery().then(result => res.json(result));
});

const performQuery = async () => {
    const bigquery = new BigQuery();

    let query = 
    `SELECT name, album, artists, duration_ms 
    FROM \`hw4-630.spotifysong.songs\` 
    WHERE \`hw4-630.spotifysong.songs\`.duration_ms > 420000 
    ORDER BY \`hw4-630.spotifysong.songs\`.name desc
    LIMIT 100;`

    const options = { query: query };

    return bigquery.query(options)
    .then(results => {
        console.log('query done');
        console.log(results[0]);
        return { results: results[0] }
    })
    .catch(err => console.error(err));

}

app.listen(PORT, () => {
    console.log(`API Listening on port ${PORT}`)
})