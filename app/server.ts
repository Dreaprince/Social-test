import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/routes';
import { validationResult } from 'express-validator';
import { myDataSource } from './datasource'; // Import your data source instance

const PORT = process.env.PORT || 3030;

const app: Application = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(cors());
//app.use(validator());

// You can create a middleware function to handle validation errors
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Then use the middleware function wherever you need to validate the request
app.use(handleValidationErrors);

// Routes
app.use('/api/v1', routes);

// Initialize the data source and start the server
myDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });
