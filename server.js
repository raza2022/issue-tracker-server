import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path'

import Issue from './models/Issue';
import User from './models/User';

import config from './config';

const app = express();
const router = express.Router();

let baseUrl = 'localhost:27017';
let dbURI = process.env.MONGODB_URI || `mongodb://localhost:27017/issues`;
console.log(dbURI);

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(dbURI);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, '/dist/issue-tracker')));
router.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: '/dist/issue-tracker'
    });
});


router.post('/user').get((req, res) => {
    User.create(req.body, (err, res) => {
        if(err){
            console.log(err)
        }
        res.status(200).json({'issue': 'Added successfully'});
    })
});

router.route('/issues').get((req, res) => {
    Issue.find((err, issues) => {
        if (err)
            console.log(err);
        else
            res.json(issues);
    });
});

router.route('/issues').post((req, res) => {
    let issue = new Issue(req.body);
    issue.save()
        .then(issue => {
            res.status(200).json({'issue': 'Added successfully'});
        })
        .catch(err => {
            res.status(400).send('Failed to create new record');
        });
});

router.route('/issues/:id').get((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (err)
            console.log(err);
        else
            res.json(issue);
    })
});

router.route('/issues/update/:id').post((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (!issue)
            return new Error('Could not load Document');
        else {
            issue.title = req.body.title;
            issue.responsible = req.body.responsible;
            issue.description = req.body.description;
            issue.severity = req.body.severity;
            issue.status = req.body.status;
            issue.save().then(issue => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

router.route('/issues/:id').delete((req, res) => {
    console.log(req.params.id)
    Issue.findByIdAndRemove({_id: req.params.id}, (err, issue) => {
        if (err)
            res.json(err);
        else
            res.json('Removed successfully');
    });
});

app.use('/', router);
app.listen(4000, () => console.log(`Express server running on port 4000`));


// router.post('/register', function(req, res) {
//
//     var hashedPassword = bcrypt.hashSync(req.body.password, 8);
//
//     User.create({
//             name : req.body.name,
//             email : req.body.email,
//             password : hashedPassword
//         },
//         function (err, user) {
//             if (err) return res.status(500).send("There was a problem registering the user.")
//             // create a token
//             var token = jwt.sign({ id: user._id }, config.secret, {
//                 expiresIn: 86400 // expires in 24 hours
//             });
//             res.status(200).send({ auth: true, token: token });
//         });
// });

// router.get('/me', function(req, res) {
//     var token = req.headers['x-access-token'];
//     if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
//
//     jwt.verify(token, config.secret, function(err, decoded) {
//         if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//
//         res.status(200).send(decoded);
//     });
// });

// GET /logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});