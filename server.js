const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

app.post("/ask", async (req, res) => {
    const query = req.body.query;

    const unsafeKeywords = ["self-harm", "illegal", "explosives", "hack"];
    for (let word of unsafeKeywords) {
        if (query.toLowerCase().includes(word)) {
            return res.json({ answer: "I cannot answer that question for safety reasons." });
        }
    }

    try {
        const response = await axios.get(
            `https://www.googleapis.com/customsearch/v1`,
            {
                params: {
                    key: GOOGLE_API_KEY,
                    cx: GOOGLE_CX,
                    q: query
                }
            }
        );

        const items = response.data.items;
        let answer;
        if (items && items.length > 0) {
            answer = items[0].snippet;
        } else {
            answer = "I couldn't find an answer, try rephrasing your question.";
        }

        res.json({ answer });
    } catch (err) {
        console.error(err);
        res.json({ answer: "Sorry, there was an error searching for your question." });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
