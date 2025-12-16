const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mediaRoutes = require('./routes/mediaRoutes');
const AppDataSource = require('./config/data-source');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize TypeORM Data Source
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

// Serve uploads folder statically
app.use('/uploads', express.static('uploads'));

app.use('/api', mediaRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
