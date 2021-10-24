import { swaggerDocs } from './utilities/swaggerDocs';
import swaggerUi from "swagger-ui-express";
import express from 'express';
import { Application } from 'express';
import { MainRouter } from './routes';
import { loadErrorHandlers } from './utilities/error-handling';
import helmet from "helmet";
import compression from "compression";
import { DEST } from "./utilities/secrets";
import './database';


const dest = DEST
const app: Application = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/media", express.static(__dirname.split('/').slice(0, -1).join('/') + dest.substring(1)));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/api', MainRouter);

loadErrorHandlers(app);


export default app;
