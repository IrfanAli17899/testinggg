const express = require('express');
const { mongoose } = require('./db/mongoose');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb')
const { User } = require('./db/models/user')
const { Ad } = require('./db/models/ad')
const { authenticate } = require("./middleware/authenticate")
const app = express();
const PORT = process.env.PORT || 786
const staticPath = path.join(__dirname, '/public')
const url = process.env.URL || 'http://localhost:786'
app.use(bodyParser.json());
app.use(express.static(staticPath))
app.set('view engine', 'hbs');



app.get('/auth', authenticate, (req, res) => {
    res.send(req.user)
})



app.get('/', (req, res) => {
    res.render('index.hbs', { url })
})
app.get('/index.html', (req, res) => {
    res.render('index.hbs', { url })
})

app.get('/register.html', (req, res) => {
    res.render('register.hbs', { url });
})
app.post('/register.html', (req, res) => {
    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        contact: req.body.contact,
        userImg: req.body.userImg
    })
    user.save().then((user) => {
        res.status(201).send(user)
    }).catch((err) => {
        if (err.code == 11000) {
            res.status(406).send({
                errors: {
                    email: {
                        message: "Email Adress Already Exists"
                    }
                },
            })
        }
        res.status(406).send(err)
    })
})


app.get('/login.html', (req, res) => {
    res.render('login.hbs', { url })
})

app.post('/login.html', (req, res) => {
    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        console.log(user);
        user.getAuthToken().then(({token,result}) => {
            return res.status(201).header('x-auth', token).send(result)
        });
    })
        .catch((errors) => {
            return res.status(400).send({ errors })
        })

})
app.get('/bikes.html', (req, res) => {
    res.render('ad.hbs', { page: "bikes".toUpperCase(), url: url })
})
app.get('/electronicsAppliances.html', (req, res) => {
    res.render('ad.hbs', { category: "electronicsAppliances".toUpperCase(), url })
})
app.get('/cars.html', (req, res) => {
    res.render('ad.hbs', { category: "cars".toUpperCase(), url })
})
app.get('/mobiles.html', (req, res) => {
    res.render('ad.hbs', { category: "mobiles".toUpperCase(), url })
})
app.get('/realEstate.html', (req, res) => {
    res.render('ad.hbs', { category: "realEstate".toUpperCase(), url })
})
app.get('/furniture.html', (req, res) => {
    res.render('ad.hbs', { category: "furniture".toUpperCase(), url })
})
app.get('/buy.html', (req, res) => {
    res.render('buy.hbs', { url })
})
app.get('/fav.html', (req, res) => {
    res.render('fav.hbs', { url })
})
app.get('/notification.html', (req, res) => {
    res.render('notification.hbs', { url })
})
app.get('/post-ad.html', (req, res) => {
    res.render('post-ad.hbs', { url })
})
app.get('/myAds.html', (req, res) => {
    res.render('myAds.hbs', { url })
})
app.get('/showAd.html', (req, res) => {
    res.render('showAd.hbs', { url })
})
//LOGOUT_ROUTE
app.get('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(() => {
        res.status(400).send()
    })
})
//POST_AD**********************************
app.post('/post-ad.html', authenticate, (req, res) => {
    req.body.sellerId = req.user._id;
    req.body.contact = req.user.contact;
    var { contact, title, description, price, model, adDate, sellerId, category, src } = req.body;
    var ad = new Ad({ contact, title, description, price, model, adDate, sellerId, category, src })
    ad.save().then((ad) => {
        res.status(201).send(ad)
    }).catch((err) => {
        res.status(400).send(err)
    })
})
//GetAd****************
// app.get('/getAd', (req, res) => {
//     console.log(req.header("x-auth"));
// })
//INDEX.HTML/ADS
app.get('/index.html/getAds', (req, res) => {
    Ad.find().then((result) => {
        let ads = [];
        for (let i = result.length - 1; i >= result.length - 9; i--) {
            ads.push(result[i])
        }
        res.status(200).send(ads)
    }).catch((err) => {
        res.status(404).send(err);
    })
})
// CATEGORY/ADS

app.get('/getCategoryAds/:category', (req, res) => {
    Ad.find({ category: req.params.category }).then((ads) => {
        res.status(200).send(ads)
    }).catch((err) => {
        res.status(404).send();
    })
})


//Search
app.get('/search/:category/:keyword', (req, res) => {
    var { keyword, category } = req.params;
    Ad.find({ category }).then((result) => {
        var arr = result.filter((item) => {
            return item.title.toLowerCase().indexOf(keyword.toLowerCase()) != -1 || item.description.toLowerCase().indexOf(keyword.toLowerCase()) != -1
        })
        res.send(arr)
    }).catch((err) => {
        res.send(err)
    })
})


//MyAds

app.get('/myAds/:id', authenticate, (req, res) => {
    var { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send({
            errors: {
                id: "Invalid Id"
            }
        })
    }
    User.findOne({ "_id": id, "tokens.token": req.token }).then((user) => {
        if (!user) {
            return Promise.reject({
                errors: {
                    id: "No User Found Against This Id"
                }
            })
        }
    }).catch((err) => {
        res.status(404).send(err)
    })
    Ad.find({ "sellerId": id }).then((result) => {
        res.status(200).send(result)
    })
})
app.delete('/deleteAd/:sellerId/:id', authenticate, (req, res) => {
    var { sellerId, id } = req.params;
    if (!ObjectId.isValid(sellerId) || !ObjectId.isValid(id)) {
        return res.status(404).send({
            errors: {
                id: "Invalid Id"
            }
        })
    }
    User.findOne({ "_id": sellerId }).then((user) => {
        if (!user) {
            return Promise.reject({
                errors: {
                    id: "No User Found Against This Id"
                }
            })
        }
    }).catch((err) => {
        res.status(404).send(err)
    })
    Ad.findOneAndRemove({ "_id": id, sellerId }).then((result) => {
        res.status(200).send(result)
    })
})

app.patch('/editPost/:sellerId/:id', authenticate, (req, res) => {
    var { sellerId, id } = req.params;
    var { contact, title, description, price, model, adDate, sellerId, category, src } = req.body;
    var ad = { contact, title, description, price, model, adDate, sellerId, category, src, _id: id }
    if (!ObjectId.isValid(sellerId) || !ObjectId.isValid(id)) {
        return res.status(404).send({
            errors: {
                id: "Invalid Id"
            }
        })
    }
    User.findOne({ "_id": sellerId }).then((user) => {
        if (!user) {
            return Promise.reject({
                errors: {
                    id: "No User Found Against This Id"
                }
            })
        }
    }).catch((err) => {
        res.status(404).send(err)
    })
    Ad.findOneAndUpdate({ "_id": id, sellerId }, new Ad(ad)).then((result) => {
        res.status(200).send(result)
    }).catch((err) => {
        res.send(err)
    })
})


app.patch('/addToFav/:productId', authenticate, (req, res) => {
    console.log("Hello World");

    var { productId } = req.params;
    var { token, user } = req;
    User.findOne({ "_id": user._id, "tokens.token": token }).then((user) => {
        var same = user.fav.filter((item) => {
            return item._id === productId
        })
        if (same.length) {
            return res.send({
                message: "Already Added To Favourites"
            })
        }
        user.fav.push({ _id: productId });
        user.save().then((user) => {
            return res.send({
                message: "Added To Favourites"
            })
        }).catch((err) => {
            console.log(err);
        })
    })

})

app.get('/getFav/:id', authenticate, (req, res) => {
    var { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send({
            errors: {
                id: "Invalid Id"
            }
        })
    }
    Ad.findOne({ "_id": id }).then((result) => {
        if (result) {
            res.status(200).send(result)
        }
    })
})





















app.listen(PORT, () => {
    console.log(`Serving From The Port:${PORT}`);
})