/**
 * A barebones API for making online polls.
 */
const { Sequelize, DataTypes } = require('sequelize');

const express = require('express')
const app = express()
app.use(express.json());
const port = 3000

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/data.sqlite'
});

const Poll = sequelize.define('Poll', {
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    choice1: {
        type:DataTypes.STRING,
        allowNull:false
    },
    votes1: {
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    choice2: {
        type:DataTypes.STRING,
        allowNull:false
    },
    votes2: {
        type:DataTypes.INTEGER,
        defaultValue:0
    },
});

/**
 * Sets up the Poll table in the DB and puts a default question in.
 */
async function seed() {
    await Poll.sync({force:true});
    const poll1 = Poll.build({
        question:"What is the capital of new york?",
        choice1: "New York City",
        choice2: "Albany"
    });
    poll1.save();
}

/**
 * Attempts to connect to the sqlite db.
 * @returns {boolean} Success status.
 */
async function connect_db() {
    try {
        await sequelize.authenticate();
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Route that returns all polls.
 */
app.get('/polls', async (req, res) => {
    const polls = await Poll.findAll();
    res.json(polls);
});

/**
 * Route that returns single poll with given id.
 * Returns an error if the poll does not exist.
 */
app.get('/polls/:id', async (req, res) => {
    const id = req.params.id;
    const poll = await Poll.findOne({ where: { id: id }});

    if (poll !== null) {
        res.json(poll);
    } else {
        res.status(404);
        res.send(`No poll with id: ${id}!`);
    } 
});

/**
 * Post route for creating a new poll.
 */
app.post('/polls', async (req, res) => {
    const data = req.body;
    const poll = Poll.build(data);
    try {
        await poll.save();
        res.json({pollId: poll.id });
    } catch (error) {
        res.status(400);
        res.json({'error': 'Poll requires string fields: question, choice1, choice2'});
    }
});

/**
 * Route for deleting a poll with given id.
 * Authentication should be added in a real use case.
 */
app.delete('/polls/:id', async (req, res) => {
    const id = req.params.id;
    const poll = await Poll.findOne({ where: { id: id }});

    if (poll !== null) {
        await poll.destroy();
        res.sendStatus(200);
    } else {
        res.status(404);
        res.send(`No poll with id: ${id}!`);
    } 
})

/**
 * Post route for voting on a poll. Requires the poll id and choice index.
 */
app.post('/vote/:pollId/:choice', async (req, res) => {
    const id = req.params.pollId;
    const choice = parseInt(req.params.choice);

    if (choice !== 1 && choice !== 2) {
        res.status(400);
        res.send(`Invalid choice: ${choice}`);
        return;
    }

    const poll = await Poll.findOne({ where: { id: id }});

    if (poll !== null) {
        if (choice === 1) {
            poll.votes1 = poll.votes1 + 1;
        } else {
            poll.votes2 = poll.votes2 + 1;
        }
        await poll.save();
        
        res.sendStatus(200);
    } else {
        res.status(404);
        res.send(`No poll with id: ${id}!`);
    } 
});

app.listen(port, async () => {
    console.log(`Poll app listening on port ${port}`)
    let connection_result = await connect_db();

    if (connection_result === true) {
        console.log("Connected to sqlite db.");

        // Optional: seed the database the first time running.
        // seed();
    } else {
        console.error("Failed to connect to sqlite db.");
    }
})