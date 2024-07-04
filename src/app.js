/**
 * This is the server side app.
 * This runs express and serves the client side app.
 * This also handles the handlebars engine.
 */

const path = require('path')
const express = require('express')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
const temporalAnalysis = require('./utils/temporalAnalysis')

const app = express()
const port = process.env.PORT || 3000

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

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

            temporalAnalysisData.update({
                parsedLocation: parsedLocation
            })

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