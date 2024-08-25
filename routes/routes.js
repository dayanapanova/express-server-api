const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const router = express.Router();

const Model = require("../model/model");
const User = require("../model/user");

// Register Method
router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!(first_name && last_name && email && password)) {
            res.status(400).send("All input is required");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(409).send("User already exist. Please login.");
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            first_name: first_name,
            last_name: last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,

        });

        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            { expiresIn: "5h" });

        user.token = token;

        res.status(201).json(user);

    } catch (error) {
        console.log(error);
    }
})

// Login Method
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "5h",
                }
            );

            user.token = token;
            return res.status(200).json(user);
        }

        return res.status(400).send("Invalid credentials");

    } catch (error) {

    }
})

//Post Method
router.post('/post', auth, async (req, res) => {
    const data = new Model({
        name: req.body.name,
        age: req.body.age
    })
    try {
        const dataToSave = await data.save();
        res.status(201).json(dataToSave);
    } catch (error) {
        req.status(500).json({ message: error.message });
    }
})

//Get all Method
router.get('/getAll', auth, async (req, res) => {
    try {
        const data = await Model.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get by ID Method
router.get('/getOne/:id', auth, async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

//Update by ID Method
router.patch('/update/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };
        const result = await Model.findByIdAndUpdate(id, updatedData, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

//Delete by ID Method
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Model.findByIdAndDelete(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;