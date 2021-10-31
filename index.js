const express = require("express");
const redis =  require("redis");
const axios = require("axios");
const bodyParser = require("body-parser");

const port_redis = process.env.PORT || 6379;
const port = process.env.PORT || 5000;

const redis_client = redis.createClient(port_redis);

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

checkCache = (req,res,next) => {
    const { id } = req.params;
    redis_client.get(id, (err,data) =>{
        if(err){
            console.log(err);
            res.status(500).send(err);
        }

        if(data!=null){
            res.send(data);
        }else{
            next();
        }
    });
}
app.get("/starship/:id",checkCache, async (req, res)=> {
    try{
        const {id} = req.params;
        const starshipInfo = await axios.get(
            'https://api.publicapis.org/entries'
        );
        const info = starshipInfo.data;
        // console.log(info);

        redis_client.setex(7, 3600, JSON.stringify(info));
        return res.json(info);
    }catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});

app.listen(port, ()=> console.log(`server started on port ${port}`));

