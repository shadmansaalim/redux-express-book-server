const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 8080;


const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const run = async () => {
    try {
        const db = client.db("bookies");
        const booksCollection = db.collection("books");

        app.post("/books/add-book", async (req, res) => {
            const bookData = req.body;
            console.log(bookData);
            bookData.publishedDate = new Date();

            const result = await booksCollection.insertOne(bookData);

            if (result.acknowledged) {
                res.status(200).json({
                    message: "Book added successfully",
                    book: bookData,
                });
            } else {
                res.status(400).json({
                    message: "Failed to add book.",
                });
            }

        });

        app.get("/all-books", async (req, res) => {
            const { search, genre, publicationYear, recent } = req.query;

            const filter = {};
            let result = [];

            if (search) {
                const regex = new RegExp(search, "i");
                filter.$or = [
                    { title: regex },
                    { author: regex },
                    { genre: regex },
                ];
            }

            if (genre) {
                filter.genre = genre;
            }

            if (publicationYear) {
                const yearFilter = parseInt(publicationYear);

                if (!isNaN(yearFilter)) {
                    filter.publicationDate = {
                        $regex: `.*${yearFilter}.*`
                    };
                }
            }

            result = await booksCollection.find(filter).toArray();

            if (recent) {
                const sort = { publishedDate: -1 };
                result = await booksCollection
                    .find(filter)
                    .sort(sort)
                    .limit(10)
                    .toArray();
            }

            res.status(200).json({
                message: "Books Retrieved Successfully",
                books: result,
            });
        });

        app.get("/books/:id", async (req, res) => {
            const bookId = req.params.id;
            const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });

            if (book) {
                res.status(200).json({
                    message: "Book retrieved successfully",
                    book: book,
                });
            }
            else {
                res.status(404).json({
                    message: "Book doesn't exist",
                });
            }
        });

        app.put("/books/:id", async (req, res) => {
            const bookId = req.params.id;
            const updatedBookData = req.body;

            const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });

            if (!book) {
                res.status(404).json({
                    message: "Book doesn't exists.",
                });
            }

            // Only book owner can edit/delete the book
            if (book.email !== verifiedUser.email) {
                res.status(400).json({
                    message: "You are not authorized to update book details.",
                });
            }

            const result = await booksCollection.updateOne(
                { _id: new ObjectId(bookId) },
                { $set: updatedBookData },
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({
                    message: "Book updated successfully!",
                    book: updatedBookData,
                });
            } else {
                res.status(404).json({
                    message: "Failed to updated book details.",
                });
            }

        });
        app.post('/books/reviews/:id', async (req, res) => {
            console.log("HIT")
            const bookId = req.params.id;
            const review = req.body.review;

            console.log(review);

            const result = await booksCollection.updateOne(
                { _id: new ObjectId(bookId) },
                { $push: { reviews: review } }
            );

            console.log(result);

            if (result.modifiedCount !== 1) {
                console.error('Book not found or review not added');
                res.json({ error: 'Book not found or review not added' });
                return;
            }

            console.log('Review added successfully');
            res.json({ message: 'Review added successfully' });
        });

        app.delete("/books/:id", async (req, res) => {

            const bookId = req.params.id;

            const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });


            if (!book) {
                res.status(404).json({
                    message: "Book doesn't exists.",
                });
            }

            // Only book owner can edit/delete the book
            if (book.email !== verifiedUser.email) {
                res.status(400).json({
                    message: "You are not authorized to delete book.",
                });
            }

            const result = await booksCollection.deleteOne(
                { _id: new ObjectId(bookId) }
            );

            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Book deleted successfully!",
                    book: book
                });
            }
            else {
                res.status(404).json({
                    message: "Failed to delete book.",
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Bookies App");
});

app.listen(port, () => {
    console.log(`Listening on PORT : ${port}`);
});