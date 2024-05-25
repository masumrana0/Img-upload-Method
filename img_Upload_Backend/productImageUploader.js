const formidable = require("formidable");
const { cloud_name, api_key, api_secret } = require("../environment");

const cloudinary = require("cloudinary").v2;

exports.productImageUploader = async (req, res, next) => {
  try {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      const config = {
        cloud_name: cloud_name,
        api_key: api_key,
        api_secret: api_secret,
        secure: true,
      };
      const uploadedImages = [];
      /*-------make the files object sorted -------*/
      const filesArray = Object.entries(files).map(([key, value]) => ({
        key,
        value,
      }));
      filesArray.sort((a, b) => a.key.localeCompare(b.key));
      const sortedFiles = {};
      filesArray.forEach(({ key, value }) => {
        sortedFiles[key] = value;
      });

      /*---- make an array of variant images without thumbnail ----*/
      const fileKeys = Object.keys(sortedFiles);
      const imagesArray = [];
      fileKeys
        .filter((key) => key !== "thumbnail")
        .map((key) => imagesArray.push(sortedFiles[key]));

      // upload thumbnail
      const thumbnail = sortedFiles.thumbnail;
      if (files && thumbnail) {
        try {
          const thumbnailResponse = await cloudinary.uploader.upload(
            thumbnail.filepath,
            {
              ...config,
              folder: "products",
            }
          );

          if (!thumbnailResponse.url) {
            return res.status(400).json({
              status: 0,
              error: "Something went wrong with the thumbnail upload",
            });
          }

          uploadedImages.push(thumbnailResponse.url);
        } catch (error) {
          return res.status(401).json({
            status: 0,
            error: error.message,
          });
        }
      }
      // upload images
      if (Array.isArray(imagesArray)) {
        for (const image of imagesArray) {
          try {
            const imageResponse = await cloudinary.uploader.upload(
              image.filepath,
              {
                ...config,
                folder: "products",
              }
            );

            if (!imageResponse.url) {
              return res.status(400).json({
                status: 0,
                error: "Something went wrong with one of the image uploads",
              });
            }

            uploadedImages.push(imageResponse.url);
          } catch (error) {
            return res.status(401).json({
              status: 0,
              error: error.message,
            });
          }
        }
      }

      req.uploadedImages = uploadedImages;

      req.body = fields;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: 0,
      error: error.message,
    });
  }
};
