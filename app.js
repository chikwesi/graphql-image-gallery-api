require('dotenv').config()
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const express = require('express');
const mongoose = require('mongoose');
const url = require('url')
const resolvers = require('./src/resolvers/resolvers')
const typeDefs = require('./src/typedefs/typedef')
// const cors = require('cors')
// const initRoutes = require('./src/routes')

const path = require('path')
const env = process.env;

mongoose.connect(`mongodb+srv://${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@cluster0.qkyhf.azure.mongodb.net/${env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
)

global.__basedir = __dirname;

const server = new ApolloServer({
    typeDefs, resolvers, uploads: false,
    context: ({ req }) => ({
            baseUrl: url.format({
            protocol: req.protocol,
            host: req.get('host'),
        })
    })
})
const app = express();
app.use(graphqlUploadExpress())
app.use('/resources', express.static(path.join(__dirname, 'resources')))
// const corsOptions = { origin: "da }
// app.use(cors(corsOptions))
// app.use(express.urlencoded({ extended: true }));
// initRoutes(app);

server.applyMiddleware({ app })

app.listen(3001, () => {
    console.log('listening to port localhost:3001' + server.graphqlPath)
})