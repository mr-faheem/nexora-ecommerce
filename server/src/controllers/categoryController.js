import Category from "../models/Category.js";
import Product from "../models/Product.js";

import cloudinary from "../config/cloudinary.js";

// ======================================================
// Upload Category Image To Cloudinary
// ======================================================

const uploadCategoryImage = (
  fileBuffer
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "nexora/categories",

            resource_type:
              "image",

            transformation: [
              {
                width: 1200,
                height: 900,
                crop: "fill",
                gravity: "auto",
                quality: "auto",
              },
            ],
          },

          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

      uploadStream.end(
        fileBuffer
      );
    }
  );
};

// ======================================================
// Create Category - Admin
// ======================================================

export const createCategory =
  async (req, res) => {
    let uploadedImage = null;

    try {
      const {
        name,
        slug,
        description,
        isActive,
      } = req.body;

      if (!name || !slug) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Category name and slug are required.",
          });
      }

      const cleanName =
        name.trim();

      const cleanSlug =
        slug
          .toLowerCase()
          .trim();

      // ----------------------------------------
      // Duplicate Check
      // ----------------------------------------

      const existingCategory =
        await Category.findOne({
          $or: [
            {
              name: {
                $regex:
                  new RegExp(
                    `^${cleanName}$`,
                    "i"
                  ),
              },
            },

            {
              slug:
                cleanSlug,
            },
          ],
        });

      if (existingCategory) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Category with this name or slug already exists.",
          });
      }

      // ----------------------------------------
      // Upload Image
      // ----------------------------------------

      if (req.file) {
        uploadedImage =
          await uploadCategoryImage(
            req.file.buffer
          );
      }

      // ----------------------------------------
      // Create
      // ----------------------------------------

      const category =
        await Category.create({
          name:
            cleanName,

          slug:
            cleanSlug,

          description:
            description?.trim() ||
            "",

          image:
            uploadedImage
              ?.secure_url ||
            "",

          imagePublicId:
            uploadedImage
              ?.public_id ||
            "",

          isActive:
            isActive ===
              undefined
              ? true
              : isActive ===
                    true ||
                  isActive ===
                    "true",
        });

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Category created successfully.",

          category,
        });
    } catch (error) {
      console.error(
        "Create Category Error:",
        error
      );

      // If upload succeeded
      // but DB operation failed
      if (
        uploadedImage?.public_id
      ) {
        await cloudinary.uploader
          .destroy(
            uploadedImage.public_id
          )
          .catch(() => {});
      }

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while creating category.",
        });
    }
  };

// ======================================================
// Get Categories
//
// GET /categories
// GET /categories?active=true
// GET /categories?active=false
// ======================================================

export const getCategories =
  async (req, res) => {
    try {
      const {
        active,
      } = req.query;

      const filter = {};

      if (
        active === "true"
      ) {
        filter.isActive =
          true;
      }

      if (
        active === "false"
      ) {
        filter.isActive =
          false;
      }

      const categories =
        await Category.find(
          filter
        ).sort({
          createdAt: -1,
        });

      return res
        .status(200)
        .json({
          success: true,

          count:
            categories.length,

          categories,
        });
    } catch (error) {
      console.error(
        "Get Categories Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while fetching categories.",
        });
    }
  };

// ======================================================
// Get Single Category
// ======================================================

export const getCategoryById =
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Category not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          category,
        });
    } catch (error) {
      console.error(
        "Get Category Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while fetching category.",
        });
    }
  };

// ======================================================
// Update Category - Admin
// ======================================================

export const updateCategory =
  async (req, res) => {
    let uploadedImage = null;

    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Category not found.",
          });
      }

      const {
        name,
        slug,
        description,
        isActive,
        removeImage,
      } = req.body;

      // ----------------------------------------
      // Name / Slug
      // ----------------------------------------

      if (
        name !== undefined ||
        slug !== undefined
      ) {
        const nextName =
          name !== undefined
            ? name.trim()
            : category.name;

        const nextSlug =
          slug !== undefined
            ? slug
                .toLowerCase()
                .trim()
            : category.slug;

        const duplicate =
          await Category.findOne({
            _id: {
              $ne:
                category._id,
            },

            $or: [
              {
                name: {
                  $regex:
                    new RegExp(
                      `^${nextName}$`,
                      "i"
                    ),
                },
              },

              {
                slug:
                  nextSlug,
              },
            ],
          });

        if (duplicate) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Category with this name or slug already exists.",
            });
        }

        category.name =
          nextName;

        category.slug =
          nextSlug;
      }

      // ----------------------------------------
      // Description
      // ----------------------------------------

      if (
        description !==
        undefined
      ) {
        category.description =
          description.trim();
      }

      // ----------------------------------------
      // Active / Inactive
      // ----------------------------------------

      if (
        isActive !==
        undefined
      ) {
        category.isActive =
          isActive === true ||
          isActive === "true";
      }

      // ----------------------------------------
      // Remove Existing Image
      // ----------------------------------------

      if (
        removeImage ===
          true ||
        removeImage ===
          "true"
      ) {
        if (
          category
            .imagePublicId
        ) {
          await cloudinary
            .uploader
            .destroy(
              category
                .imagePublicId
            )
            .catch(
              (error) => {
                console.error(
                  "Old Category Image Delete Error:",
                  error
                );
              }
            );
        }

        category.image = "";
        category.imagePublicId =
          "";
      }

      // ----------------------------------------
      // Replace Image
      // ----------------------------------------

      if (req.file) {
        uploadedImage =
          await uploadCategoryImage(
            req.file.buffer
          );

        const oldPublicId =
          category.imagePublicId;

        category.image =
          uploadedImage.secure_url;

        category.imagePublicId =
          uploadedImage.public_id;

        // Save new image first
        await category.save();

        // Delete old only after
        // new DB data is safe
        if (
          oldPublicId &&
          oldPublicId !==
            uploadedImage.public_id
        ) {
          await cloudinary
            .uploader
            .destroy(
              oldPublicId
            )
            .catch(
              (error) => {
                console.error(
                  "Old Category Image Delete Error:",
                  error
                );
              }
            );
        }

        return res
          .status(200)
          .json({
            success: true,

            message:
              "Category updated successfully.",

            category,
          });
      }

      await category.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Category updated successfully.",

          category,
        });
    } catch (error) {
      console.error(
        "Update Category Error:",
        error
      );

      // If new Cloudinary upload
      // occurred but DB failed
      if (
        uploadedImage
          ?.public_id
      ) {
        await cloudinary
          .uploader
          .destroy(
            uploadedImage
              .public_id
          )
          .catch(() => {});
      }

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while updating category.",
        });
    }
  };

// ======================================================
// Delete Category - Admin
// ======================================================

export const deleteCategory =
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Category not found.",
          });
      }

      // ----------------------------------------
      // Do not delete if products use category
      // ----------------------------------------

      const productCount =
        await Product.countDocuments({
          category:
            category._id,
        });

      if (
        productCount > 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message: `Cannot delete "${category.name}" because ${productCount} product${
              productCount ===
              1
                ? ""
                : "s"
            } ${
              productCount ===
              1
                ? "is"
                : "are"
            } using this category.`,
          });
      }

      // ----------------------------------------
      // Delete Cloudinary Image
      // ----------------------------------------

      if (
        category.imagePublicId
      ) {
        await cloudinary
          .uploader
          .destroy(
            category
              .imagePublicId
          )
          .catch(
            (error) => {
              console.error(
                "Category Image Delete Error:",
                error
              );
            }
          );
      }

      await category.deleteOne();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Category deleted successfully.",
        });
    } catch (error) {
      console.error(
        "Delete Category Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while deleting category.",
        });
    }
  };