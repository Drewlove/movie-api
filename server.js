require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const app = express()

const morganSettings = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganSettings));

app.use(helmet()); 
app.use(cors()); 

const movieDB = require('./movieDB')

app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN; 
    const authToken = req.get('Authorization').split(' ')[1]
    if(apiToken !== authToken || !authToken){
        res.json('must have valid authorization')
    }
    next()
})

app.get('/movies', function sortByGenre(req, res){
    const{avgVote, country, genre} = req.query; 
    let results = movieDB; 
    if(avgVote){
        results = movieDB.filter(movie => movie.avg_vote >= parseFloat(avgVote)); 
    }
    if(country){
        results = movieDB.filter(movie => 
            movie.country.toLowerCase() === country.toLowerCase())
    }
    if(genre){
        results = movieDB.filter(movie => 
            movie.genre.toLowerCase() === genre.toLowerCase())
        }
    res.json(results)
})

app.use((error, req, res, next)=> {
    let response; 
    if(process.env.NODE_ENV === 'production'){
        response = {error: {message: 'server error'}}
    } else {
        response = {error}
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT)


