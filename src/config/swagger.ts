import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'API Corredora',
      version: '1.0.0',
      description: 'API REST para gestión de propiedades',
    },

    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  apis: ['./src/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
