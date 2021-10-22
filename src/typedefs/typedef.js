const { gql } = require('apollo-server-express');

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

module.exports = typeDefs