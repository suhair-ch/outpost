import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.get('/', (req, res) => {
    res.send('OUT POST Backend API - Phase 1 MVP');
});

// Since we can't run the server without 'npm install', we just export or console log
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (Fixed)`);
    });
}

export default app;
