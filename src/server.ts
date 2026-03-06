import AgentAPI from 'apminsight';
AgentAPI.config();

import 'dotenv/config';
import express from 'express';
import subjectRouter from './routes/subject';
import cors from 'cors';
import securityMiddleware from './middleware/security';
import { auth } from './lib/auth';
import { toNodeHandler} from 'better-auth/node';

const app = express();
const PORT = Number(process.env.PORT ?? 8000);

if(!process.env.FRONTEND_URL){
	console.warn('FRONTEND_URL is not defined. CORS will not be configured properly.');
}

app.use(express.json());

// Ensure an Origin header exists for downstream middleware (Arcjet / Better Auth).
app.use((req, _res, next) => {
	if (!req.headers.origin || req.headers.origin === 'null') {
		req.headers.origin = process.env.FRONTEND_URL || 'http://localhost:3000';
	}
	next();
});

app.use(securityMiddleware)

app.use(cors({
	origin: process.env.FRONTEND_URL || false,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true,
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.get('/', (_req, res) => {
	res.send('Classroom backend is running.');
});

app.use('/api/subjects', subjectRouter);

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
