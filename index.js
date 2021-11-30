const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = 3001;

require('dotenv').config();
const BigQuery = require('@google-cloud/bigquery');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Allow CORS
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/', (req, res) => {
    performQuery(req.body).then(result => res.json(result));
});

const isFirstFilter = (query) => {
    if (query.includes('WHERE')) {
        return 'AND'
    }
    return 'WHERE'
}

const performQuery = async (attr) => {
    const bigquery = new BigQuery();
    const attrList = ['danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature', 'year']

    let query = 
    `SELECT name, artists, album, explicit, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo, duration_ms, time_signature, year
    FROM \`hw4-630.spotifysong.songs\` `

    if ('name' in attr && attr['name'] != '') {
        query += isFirstFilter(query) + ` lower(name) LIKE \'%${attr['name'].toLowerCase()}%\' `;
    }
    if ('album' in attr && attr['album'] != '') {
        query += isFirstFilter(query) + ` lower(album) LIKE \'%${attr['album'].toLowerCase()}%\' `;
    }
    if ('artists' in attr && attr['artists'] != '') {
        query += isFirstFilter(query) + ` lower(artists) LIKE \'%${attr['artists'].toLowerCase()}%\' `;
    }
    if ('explicit' in attr) {
        query += isFirstFilter(query) + ` explicit = ${attr['explicit']} `;
    }
    if ('mode' in attr) {
        attr['mode'] = attr['mode'] ? 1 : 0; 
        query += isFirstFilter(query) + ` mode = ${attr['mode']} `;
    }
    attrList.forEach((column) => {
        if (column in attr) {
            query += isFirstFilter(query) + ` ${column} >= ${attr[column][0]} AND ${column} <= ${attr[column][1]} `;
        }
    })

    query += `ORDER BY name desc
    LIMIT 100;`;

    console.log(query);

    const options = { query: query };

    return bigquery.query(options)
    .then(results => {
        console.log('query done');
        console.log(results[0])
        return { results: results[0] }
    })
    .catch(err => console.error(err));

}

app.listen(PORT, () => {
    console.log(`API Listening on port ${PORT}`)
})