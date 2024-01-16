require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
var jsonParser = bodyParser.json();
const corsOptions = {
    origin: process.env.FRONTEND_HOST,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to mongo.");
    } catch (err) {
        console.log(err);
    }
}

//events attended array will be filled with event ids
const Account = mongoose.model("Account", {
    uuid: { type: String, default: "" },
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "Supporter" },
    password: { type: String, default: "" },
    phone: { type: Number, default: 1234567890 },
    dateJoined: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    eventsAttended: { type: Array, default: [] },
    donations: { type: Array, default: [] },
})

const Event = mongoose.model("Event", {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    visible: { type: String, default: "Visible" },
    status: { type: String, default: "pending" },
    registrationOpen: { type:  String, default: "Open" },
    registrationStartDateTime: { type: Date, default: Date.now },
    registrationEndDateTime: { type: Date, default: Date.now },
    startDateTime: { type: Date, default: Date.now },
    endDateTime: { type: Date, default: Date.now },
    cost: { type: String, default: "Free" },
})

const BlogPost = mongoose.model("BlogPost", {
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
})

app.post("/signIn", jsonParser, async (req, res) => {
    Account.findOneAndUpdate({ uuid: req.body.uuid }, { lastLogin: Date.now() }).then((account) => {
        if (account) {
            res.status(200).send({ uuid: account.uuid, status: "Logged Sign In" });
        } else {
            res.status(400).send("Account not found.");
        }
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.get("/requestSignIn", async (req, res) => {
    Account.findOne({ email: req.query.email }).then((account) => {
        if (account) {
            //account with that email exists now check if the password matches
            if (account.password == req.query.password) {
                res.status(200).send({ uuid: account.uuid, status: "Sign In approved." });
            } else {
                res.status(400).send("Incorrect password.");
            }
        } else {
            res.status(400).send("Account not found.");
        }
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err);
    })
})

app.post("/newPost", jsonParser, async (req, res) => {
    try {
        const post = new BlogPost({
            title: req.body.title,
            content: req.body.content,
            visible: req.body.visible,
        })
        await post.save();
        res.status(200).send(post);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/createEvent", jsonParser, async (req, res) => {
    try {
        const event = new Event({
            title: req.body.title,
            description: req.body.description,
            visible: req.body.visible,
            status: req.body.status,
            registrationOpen: req.body.registrationOpen,
            registrationStartDateTime: req.body.registrationStartDateTime,
            registrationEndDateTime: req.body.registrationEndDateTime,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            cost: req.body.cost,
        })
        await event.save();
        res.status(200).send(event);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.get("/getEvents", async (req, res) => {
    try {
        Event.find({}).then((events) => {
            if (events) {
                res.status(200).send(events);
            } else {
                res.status(400).send("No events found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.post("/createAccount", jsonParser, async (req, res) => {
    //password has already been hashed by frontend
    try {
        Account.findOne({ email: req.body.email }).then(async (account) => {
            if (account) {
                res.status(400).send("Account with that email already exists.");
            } else {
                const uuid = uuidv4();
                const account = new Account({
                    uuid: uuid,
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    phone: req.body.phone,
                    dateJoined: Date.now(),
                    lastLogin: Date.now(),
                })
                await account.save();
                res.status(200).send({uuid: uuid, status: "Account created."});
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
});

app.get("/getAccount", async (req, res) => {
    try {
        Account.findOne({ uuid: req.query.uuid }).then((account) => {
            if (account) {
                res.status(200).send(account);
            } else {
                res.status(400).send("Account not found.");
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

app.listen(8443, () => {
    console.log("Server is running on port 8443.");
})