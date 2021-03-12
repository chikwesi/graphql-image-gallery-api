require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const imageModel = require('./models/image')
const { ApolloServer, gql } = require('apollo-server-express');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
// const cors = require('cors')
// const initRoutes = require('./src/routes')
const fs = require('fs')
const path = require('path')
const env = process.env;

mongoose.connect(`mongodb+srv://${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@cluster0.qkyhf.azure.mongodb.net/${env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
)

global.__basedir = __dirname;

const typeDefs = gql`
    scalar Upload
    type File {
        filename: String!,
        mimeype: String!,
        encoding: String!,
        url: String
    }
    input ImageInput{
        title: String!,
        url: String!,
        date: String!,
        location: String
    }

    type Query {
      getImages: [Image!]!
      uploads: [File]
    }

    type Mutation {
      addImage(imageInput: ImageInput): Image,
      updateImage(imageId: String, imageInput: ImageInput): Image,
      singleUpload(file: Upload!): Image!
    }

    type Image {
        id: String,
        "this is the title of the image"
        title: String,
        "this is the url of the image"
        url: String,
        "this is the date the image was created"
        date: String
    }
`
/**
 *
 * Object
 * Scalar = Int, String, Float, Boolean, ID
 * Mutation
 * Query
 * Input
 * Enum
 * ! means it should not be null else throw error
 *
 */

const resolvers = {
    Upload: GraphQLUpload,
    Query: {
        getImages: async () => await imageModel.find({}),
        uploads: async () => {
            const directoryPath = __basedir + "/resources/static/assets/uploads";
            try {
                const files = await fs.promises.readdir(directoryPath)
                console.log(files)
                let fileInfos = []
                files.forEach(file => {
                    fileInfos.push({
                        filename: file,
                        url: baseUrl + file
                    })
                })
                return fileInfos
            }
            catch (err) {
                if (err) {
                    console.log(err)
                    // res.status(500).send({
                    //     message: "Unable to scan files"
                    // })
                }
            }
        }
    },
    Mutation: {
        addImage: async (_, { imageInput }) => {
            try {
                let response = await imageModel.create(imageInput)
                return response
            } catch (e) {
                console.log(e)
                return e.message
            }

        },
        updateImage: async (_, { imageId, imageInput }) => {
            try {
                let response = await imageModel.findByIdAndUpdate(imageId, imageInput, { new: true })
                return response
            } catch (e) {
                console.log(e)
                return e.message
            }
        },
        singleUpload: async (parent, { file }) => {
            const { createReadStream, filename, mimetype, encoding } = await file;
            try {
                let storageLocation =  "/resources/static/assets/uploads/" + filename
                let path = __basedir + storageLocation;
                let stream = createReadStream();
                let savingFile = await new Promise((resolve, reject) => {
                    stream
                        .pipe(fs.createWriteStream(path))
                        .on("finish", () => {
                            resolve({
                                success: true,
                                message: "Successfully Uploaded",
                                mimetype, filename, encoding, location: path
                            })
                        })
                        .on("error", (err) => {
                             console.log(err)
                            console.log("Error Event Emitted")
                            reject({
                                success: false,
                                message: "Failed"
                            })
                        })
                })
                if (savingFile.success) {
                    let image = await imageModel.create({
                        title: filename,
                        url: path,
                        date: Date.now()
                    })
                    return image;
                }
            }
            catch (e) {
                console.log(e)
            }
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers, uploads: false })
const app = express();
app.use(graphqlUploadExpress())
app.use('/resources',express.static(path.join(__dirname, 'resources')))
// const corsOptions = { origin: "da }
// app.use(cors(corsOptions))
// app.use(express.urlencoded({ extended: true }));
// initRoutes(app);

server.applyMiddleware({ app })

app.listen(3001, () => {
    console.log('listening to port localhost:3001' + server.graphqlPath)
})