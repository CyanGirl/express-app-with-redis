const express = require('express')
const axios = require('axios')
const cors = require('cors')
const Redis = require('ioredis')

const redis = new Redis()
const app = express()
app.use(cors())
const port = 3000

const getRandomUser = async () =>{
    const url = 'https://randomuser.me/api/';
    const {data} = await axios.get(url);
    return data.results[0];
}

const setCache = async (key,data) => {
    const resp = await redis.set(key, JSON.stringify(data), 'EX', 120);
    return resp;
}
const getCache = async (key) => {
    return redis.get(key, async (error, result) => {
        if (error) {
            throw 'Could not get Data';
        }
        return result;  
    })
}


app.get('/', async (req,res) => {
    let user = {};
    try {
        user = await getCache('user');
        if ( user === null ){
            user = await getRandomUser();
            await setCache('user',user);
        } 
        else {
            user = JSON.parse(user);
        }
        res.json(user);
    }
    catch(err) {
        console.log(err);
    }
})

app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
})
