import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import configurePassport from './middlewares/passport.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import businessProfileRoutes from './routes/businessProfile.routes.js';
import factoryRoutes from './routes/factory.routes.js';
import partyRoutes from './routes/party.routes.js';
import itemRoutes from './routes/item.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

configurePassport();

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            process.env.CORS,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000'
        ].filter(Boolean);

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(passport.initialize());

// Route registrations
app.use('/api/auth', authRoutes);
app.use('/api/settings/profile', businessProfileRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
