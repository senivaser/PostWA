import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PostWA API",
      version: "1.0.0",
      description: "API приложения для создание заметок",
    },
    servers: [
      {
        url: "http://194.67.108.25:3000",
        name: "Deployment Server"
      },
      {
        url: "http://localhost:3000",
        name: "Local Server"
      },

    ],
  },
  apis: ["./src/routes/*.ts"],
};



export const swaggerDocs = swaggerJsDoc(swaggerOptions);