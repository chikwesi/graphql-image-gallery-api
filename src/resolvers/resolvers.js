const { GraphQLUpload } = require('graphql-upload');
const imageModel = require('../../models/image')
const fs = require('fs')
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
                let storageLocation = "/resources/static/assets/uploads/" + filename
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
                        url: storageLocation,
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
module.exports = resolvers