/**
 * This is the server side app.
 * This runs express and serves the client side app.
 * This also handles the handlebars engine.
 */

import path from 'path';
import express from 'express';
import hbs from 'hbs';
import geocode from './utils/geocode.js';
import temporalAnalysis from './utils/temporalAnalysis.js';

const app = express()
const port = process.env.PORT || 3000

// Define paths for Express config
const publicDirectoryPath = path.join(path.resolve(), 'public');
const viewsPath = path.join(path.resolve(), 'templates', 'views');
const partialsPath = path.join(path.resolve(), 'templates', 'partials');

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// Set up proxy trust for IP address
app.set('trust proxy', true)

// Setup paths
app.get('', (req, res) => {
    res.render('index', {
        title: 'Time'
    })
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    })
});

app.get('/help', (req, res) => {
    res.render('help', {
        title: 'Help'
    })
});

app.get('/getTime', (req, res) => {
    if (!req.query.location) {
        return res.send({
            error: 'You must provide a location!'
        })
    }
    
    geocode(req.query.location, (error, { latitude, longitude, parsedLocation } = {}) => {
        if (error) {
            return res.send({ error })
        }

        function json(url) {
            return fetch(url).then(res => res.json());
        }

        temporalAnalysis(latitude, longitude, req.ip, (error, temporalAnalysisData) => {
            if (error) {
                return res.send({ error })
            }

            // Add parsed location to temporalAnalysisData
            temporalAnalysisData.parsedLocation = parsedLocation
            temporalAnalysisData.ipAddress = req.ip

            res.send(temporalAnalysisData)
        })
    })
});

app.get('/help/*', (req, res) => {
    res.render('404', {
        title: '404',
        errorMessage: 'Help article not found.'
    })
});

app.get('*', (req, res) => {
    res.render('404', {
        title: '404',
        errorMessage: 'Page not found.'
    })
});

app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
});