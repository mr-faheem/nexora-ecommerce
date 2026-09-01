import mongoose from "mongoose";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

import cloudinary from "../config/cloudinary.js";

// ======================================================
// Upload Buffer To Cloudinary
// ======================================================

const uploadBufferToCloudinary = (
  fileBuffer
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "nexora/products",

            resource_type:
              "image",
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
// Delete Single Product Image - Admin
// ======================================================

export const deleteProductImage =
  async (req, res) => {
    try {
      const {
        productId,
        publicId,
      } = req.body;

      if (
        !productId ||
        !publicId
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "productId and publicId are required.",
          });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid productId.",
          });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Product not found.",
          });
      }

      const imageExists =
        product.images.some(
          (image) =>
            image?.publicId ===
            publicId
        );

      if (!imageExists) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Image not found in product.",
          });
      }

      const cloudinaryResult =
        await cloudinary.uploader.destroy(
          publicId
        );

      product.images =
        product.images.filter(
          (image) =>
            image?.publicId !==
            publicId
        );

      await product.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Product image deleted successfully.",

          cloudinaryResult,

          images:
            product.images,
        });
    } catch (error) {
      console.error(
        "Delete Product Image Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while deleting product image.",
        });
    }
  };

// ======================================================
// Create Product - Admin
// ======================================================

export const createProduct =
  async (req, res) => {
    let uploadedImages = [];

    try {
      const {
        name,
        slug,
        description,
        price,
        discountPrice,
        category,
        stock,
        brand,
        isFeatured,
        isActive,
      } = req.body;

      if (
        !name ||
        !slug ||
        !description ||
        price ===
          undefined ||
        !category
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name, slug, description, price and category are required.",
          });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          category
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid category ID.",
          });
      }

      const productPrice =
        Number(price);

      const productDiscountPrice =
        discountPrice !==
          undefined &&
        discountPrice !== ""
          ? Number(
              discountPrice
            )
          : 0;

      const productStock =
        stock !== undefined &&
        stock !== ""
          ? Number(stock)
          : 0;

      if (
        Number.isNaN(
          productPrice
        ) ||
        productPrice < 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid product price.",
          });
      }

      if (
        Number.isNaN(
          productDiscountPrice
        ) ||
        productDiscountPrice <
          0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid discount price.",
          });
      }

      if (
        productDiscountPrice >
          productPrice &&
        productDiscountPrice >
          0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Discount price cannot be greater than original price.",
          });
      }

      if (
        Number.isNaN(
          productStock
        ) ||
        productStock < 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid product stock.",
          });
      }

      const existingProduct =
        await Product.findOne({
          slug:
            slug
              .toLowerCase()
              .trim(),
        });

      if (
        existingProduct
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Product with this slug already exists.",
          });
      }

      // Category must exist
      const categoryExists =
        await Category.findById(
          category
        );

      if (!categoryExists) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Category not found.",
          });
      }

      // IMPORTANT:
      // New product cannot use
      // inactive category.
      if (
        !categoryExists.isActive
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message: `Cannot add product to inactive category "${categoryExists.name}".`,
          });
      }

      if (
        req.files?.length >
        0
      ) {
        const uploadResults =
          await Promise.all(
            req.files.map(
              (file) =>
                uploadBufferToCloudinary(
                  file.buffer
                )
            )
          );

        uploadedImages =
          uploadResults.map(
            (result) => ({
              url:
                result.secure_url,

              publicId:
                result.public_id,
            })
          );
      }

      const product =
        await Product.create(
          {
            name:
              name.trim(),

            slug:
              slug
                .toLowerCase()
                .trim(),

            description:
              description.trim(),

            price:
              productPrice,

            discountPrice:
              productDiscountPrice,

            category,

            stock:
              productStock,

            images:
              uploadedImages,

            brand:
              brand?.trim() ||
              "",

            isFeatured:
              isFeatured ===
                true ||
              isFeatured ===
                "true",

            isActive:
              isActive ===
              undefined
                ? true
                : isActive ===
                    true ||
                  isActive ===
                    "true",
          }
        );

      const populatedProduct =
        await Product.findById(
          product._id
        ).populate(
          "category",
          "name slug isActive"
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Product created successfully.",

          product:
            populatedProduct,
        });
    } catch (error) {
      console.error(
        "Create Product Error:",
        error
      );

      if (
        uploadedImages.length >
        0
      ) {
        await Promise.allSettled(
          uploadedImages.map(
            (image) =>
              cloudinary.uploader.destroy(
                image.publicId
              )
          )
        );
      }

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while creating product.",
        });
    }
  }; 
  // ======================================================
// Get All Products - Admin
// Active + Inactive
// ======================================================

export const getAdminProducts =
  async (req, res) => {
    try {
      const {
        search = "",
        category,
        status = "all",
        sort = "newest",
        page = 1,
        limit = 50,
      } = req.query;

      const filter = {};

      // ==================================================
      // Search
      // ==================================================

      if (search.trim()) {
        filter.$or = [
          {
            name: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            description: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            brand: {
              $regex: search.trim(),
              $options: "i",
            },
          },
        ];
      }

      // ==================================================
      // Category
      // Admin can also see products of inactive category
      // ==================================================

      if (category) {
        const categoryDoc =
          await Category.findOne({
            $or: [
              {
                slug:
                  category
                    .toLowerCase()
                    .trim(),
              },
              {
                name: {
                  $regex: `^${category}$`,
                  $options: "i",
                },
              },
            ],
          });

        if (!categoryDoc) {
          return res
            .status(200)
            .json({
              success: true,
              totalProducts: 0,
              currentPage: 1,
              totalPages: 0,
              limit:
                Number(limit) || 50,
              products: [],
            });
        }

        filter.category =
          categoryDoc._id;
      }

      // ==================================================
      // Active Status
      // ==================================================

      if (status === "active") {
        filter.isActive = true;
      }

      if (status === "inactive") {
        filter.isActive = false;
      }

      // status === all
      // No isActive filter.
      // Therefore both Active + Inactive are returned.

      // ==================================================
      // Pagination
      // ==================================================

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const perPage =
        Math.min(
          Math.max(
            Number(limit) || 50,
            1
          ),
          100
        );

      const skip =
        (currentPage - 1) *
        perPage;

      // ==================================================
      // Sorting
      // ==================================================

      let sortOption = {
        createdAt: -1,
      };

      switch (sort) {
        case "oldest":
          sortOption = {
            createdAt: 1,
          };
          break;

        case "name-asc":
          sortOption = {
            name: 1,
          };
          break;

        case "name-desc":
          sortOption = {
            name: -1,
          };
          break;

        case "newest":
        default:
          sortOption = {
            createdAt: -1,
          };
          break;
      }

      const totalProducts =
        await Product.countDocuments(
          filter
        );

      const products =
        await Product.find(
          filter
        )
          .populate(
            "category",
            "name slug isActive"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(perPage);

      const totalPages =
        Math.ceil(
          totalProducts /
            perPage
        );

      return res
        .status(200)
        .json({
          success: true,

          totalProducts,

          currentPage,

          totalPages,

          limit: perPage,

          products,
        });
    } catch (error) {
      console.error(
        "Get Admin Products Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while fetching admin products.",
        });
    }
  };

// ======================================================
// Get All Products - Public
// ======================================================

export const getProducts =
  async (req, res) => {
    try {
      const {
        search = "",
        category,
        minPrice,
        maxPrice,
        featured,
        sort = "newest",
        page = 1,
        limit = 10,
      } = req.query;

      const filter = {};

      // ==================================================
      // Search
      // ==================================================

      if (search) {
        filter.$or = [
          {
            name: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            description: {
              $regex:
                search,

              $options:
                "i",
            },
          },

          {
            brand: {
              $regex:
                search,

              $options:
                "i",
            },
          },
        ];
      }

      // ==================================================
      // Category
      //
      // Only ACTIVE category can be used publicly.
      // ==================================================

      if (category) {
        const categoryDoc =
          await Category.findOne(
            {
              isActive: true,

              $or: [
                {
                  slug:
                    category
                      .toLowerCase()
                      .trim(),
                },

                {
                  name: {
                    $regex: `^${category}$`,
                    $options:
                      "i",
                  },
                },
              ],
            }
          );

        if (!categoryDoc) {
          return res
            .status(200)
            .json({
              success: true,

              totalProducts:
                0,

              currentPage:
                Math.max(
                  Number(
                    page
                  ) || 1,
                  1
                ),

              totalPages:
                0,

              limit:
                Number(
                  limit
                ) || 10,

              products: [],
            });
        }

        filter.category =
          categoryDoc._id;
      } else {
        // No category filter:
        // still hide products whose
        // category is inactive.

        const activeCategories =
          await Category.find({
            isActive: true,
          }).select("_id");

        const activeCategoryIds =
          activeCategories.map(
            (
              activeCategory
            ) =>
              activeCategory._id
          );

        filter.category = {
          $in:
            activeCategoryIds,
        };
      }

      // ==================================================
      // Price
      // ==================================================

      if (
        minPrice !==
          undefined ||
        maxPrice !==
          undefined
      ) {
        filter.price = {};

        if (
          minPrice !==
          undefined
        ) {
          const minimumPrice =
            Number(
              minPrice
            );

          if (
            Number.isNaN(
              minimumPrice
            ) ||
            minimumPrice <
              0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "Invalid minimum price.",
              });
          }

          filter.price.$gte =
            minimumPrice;
        }

        if (
          maxPrice !==
          undefined
        ) {
          const maximumPrice =
            Number(
              maxPrice
            );

          if (
            Number.isNaN(
              maximumPrice
            ) ||
            maximumPrice <
              0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "Invalid maximum price.",
              });
          }

          filter.price.$lte =
            maximumPrice;
        }

        if (
          minPrice !==
            undefined &&
          maxPrice !==
            undefined &&
          Number(
            minPrice
          ) >
            Number(
              maxPrice
            )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Minimum price cannot be greater than maximum price.",
            });
        }
      }

      // ==================================================
      // Featured
      // ==================================================

      if (
        featured !==
        undefined
      ) {
        if (
          featured !==
            "true" &&
          featured !==
            "false"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "featured must be true or false.",
            });
        }

        filter.isFeatured =
          featured ===
          "true";
      }

      // Only active products
      filter.isActive =
        true;

      // ==================================================
      // Pagination
      // ==================================================

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const perPage =
        Math.min(
          Math.max(
            Number(limit) ||
              10,
            1
          ),
          50
        );

      const skip =
        (currentPage -
          1) *
        perPage;

      // ==================================================
      // Sorting
      // ==================================================

      let sortOption = {};

      switch (sort) {
        case "price-low":
          sortOption = {
            price: 1,
          };
          break;

        case "price-high":
          sortOption = {
            price: -1,
          };
          break;

        case "oldest":
          sortOption = {
            createdAt: 1,
          };
          break;

        case "name-asc":
          sortOption = {
            name: 1,
          };
          break;

        case "name-desc":
          sortOption = {
            name: -1,
          };
          break;

        case "newest":
        default:
          sortOption = {
            createdAt: -1,
          };
          break;
      }

      const totalProducts =
        await Product.countDocuments(
          filter
        );

      const products =
        await Product.find(
          filter
        )
          .populate(
            "category",
            "name slug isActive"
          )
          .sort(
            sortOption
          )
          .skip(skip)
          .limit(
            perPage
          );

      const totalPages =
        Math.ceil(
          totalProducts /
            perPage
        );

      return res
        .status(200)
        .json({
          success: true,

          totalProducts,

          currentPage,

          totalPages,

          limit: perPage,

          sort,

          products,
        });
    } catch (error) {
      console.error(
        "Get Products Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while fetching products.",
        });
    }
  };

// ======================================================
// Get Single Product
// ======================================================

export const getProductById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid product ID.",
          });
      }

      const product =
        await Product.findById(
          id
        ).populate(
          "category",
          "name slug isActive"
        );

      if (!product) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Product not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          product,
        });
    } catch (error) {
      console.error(
        "Get Product Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while fetching product.",
        });
    }
  };

// ======================================================
// Update Product - Admin
// ======================================================

export const updateProduct =
  async (req, res) => {
    let newlyUploadedImages =
      [];

    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid product ID.",
          });
      }

      const existingProduct =
        await Product.findById(
          id
        );

      if (
        !existingProduct
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Product not found.",
          });
      }

      // ==================================================
      // Category Validation
      // ==================================================

      if (
        req.body.category
      ) {
        if (
          !mongoose.Types.ObjectId.isValid(
            req.body
              .category
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Invalid category ID.",
            });
        }

        const categoryExists =
          await Category.findById(
            req.body
              .category
          );

        if (
          !categoryExists
        ) {
          return res
            .status(404)
            .json({
              success:
                false,

              message:
                "Category not found.",
            });
        }

        const isSameCategory =
          existingProduct.category.toString() ===
          req.body.category.toString();

        // Inactive category allowed
        // ONLY if product was already
        // inside that same category.
        if (
          !categoryExists.isActive &&
          !isSameCategory
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message: `Cannot move product to inactive category "${categoryExists.name}".`,
            });
        }
      }

      // ==================================================
      // Duplicate Slug
      // ==================================================

      if (req.body.slug) {
        const duplicate =
          await Product.findOne(
            {
              _id: {
                $ne:
                  existingProduct._id,
              },

              slug:
                req.body.slug
                  .toLowerCase()
                  .trim(),
            }
          );

        if (duplicate) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Product with this slug already exists.",
            });
        }
      }

      // ==================================================
      // Upload New Images
      // ==================================================

      if (
        req.files?.length >
        0
      ) {
        const uploadResults =
          await Promise.all(
            req.files.map(
              (file) =>
                uploadBufferToCloudinary(
                  file.buffer
                )
            )
          );

        newlyUploadedImages =
          uploadResults.map(
            (result) => ({
              url:
                result.secure_url,

              publicId:
                result.public_id,
            })
          );
      }

      const updateData = {
        ...req.body,
      };

      if (
        updateData.name !==
        undefined
      ) {
        updateData.name =
          updateData.name.trim();
      }

      if (
        updateData.slug !==
        undefined
      ) {
        updateData.slug =
          updateData.slug
            .toLowerCase()
            .trim();
      }

      if (
        updateData.description !==
        undefined
      ) {
        updateData.description =
          updateData.description.trim();
      }

      if (
        updateData.brand !==
        undefined
      ) {
        updateData.brand =
          updateData.brand.trim();
      }

      if (
        updateData.price !==
          undefined &&
        updateData.price !== ""
      ) {
        updateData.price =
          Number(
            updateData.price
          );

        if (
          Number.isNaN(
            updateData.price
          ) ||
          updateData.price <
            0
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Invalid product price.",
            });
        }
      }

      if (
        updateData.discountPrice !==
        undefined
      ) {
        updateData.discountPrice =
          updateData.discountPrice ===
          ""
            ? 0
            : Number(
                updateData.discountPrice
              );

        if (
          Number.isNaN(
            updateData.discountPrice
          ) ||
          updateData.discountPrice <
            0
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Invalid discount price.",
            });
        }
      }

      const effectivePrice =
        updateData.price !==
        undefined
          ? updateData.price
          : existingProduct.price;

      const effectiveDiscountPrice =
        updateData.discountPrice !==
        undefined
          ? updateData.discountPrice
          : existingProduct.discountPrice;

      if (
        effectiveDiscountPrice >
          effectivePrice &&
        effectiveDiscountPrice >
          0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Discount price cannot be greater than original price.",
          });
      }

      if (
        updateData.stock !==
        undefined
      ) {
        updateData.stock =
          updateData.stock ===
          ""
            ? 0
            : Number(
                updateData.stock
              );

        if (
          Number.isNaN(
            updateData.stock
          ) ||
          updateData.stock <
            0
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Invalid stock value.",
            });
        }
      }

      if (
        updateData.isFeatured !==
        undefined
      ) {
        updateData.isFeatured =
          updateData.isFeatured ===
            true ||
          updateData.isFeatured ===
            "true";
      }

      if (
        updateData.isActive !==
        undefined
      ) {
        updateData.isActive =
          updateData.isActive ===
            true ||
          updateData.isActive ===
            "true";
      }

      delete updateData.images;

      if (
        newlyUploadedImages.length >
        0
      ) {
        updateData.images = [
          ...(
            existingProduct.images ||
            []
          ),

          ...newlyUploadedImages,
        ];
      }

      const product =
        await Product.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,

            runValidators:
              true,
          }
        ).populate(
          "category",
          "name slug isActive"
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Product updated successfully.",

          product,
        });
    } catch (error) {
      console.error(
        "Update Product Error:",
        error
      );

      if (
        newlyUploadedImages.length >
        0
      ) {
        await Promise.allSettled(
          newlyUploadedImages.map(
            (image) =>
              cloudinary.uploader.destroy(
                image.publicId
              )
          )
        );
      }

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while updating product.",
        });
    }
  };

// ======================================================
// Delete Product - Admin
// ======================================================

export const deleteProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid product ID.",
          });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Product not found.",
          });
      }

      if (
        product.images &&
        product.images.length >
          0
      ) {
        const publicIds =
          product.images
            .map(
              (image) =>
                image?.publicId
            )
            .filter(
              Boolean
            );

        await Promise.all(
          publicIds.map(
            (publicId) =>
              cloudinary.uploader.destroy(
                publicId
              )
          )
        );
      }

      await Product.findByIdAndDelete(
        id
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Product deleted successfully.",
        });
    } catch (error) {
      console.error(
        "Delete Product Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while deleting product.",
        });
    }
  };

// ======================================================
// Related Products - Public
// ======================================================

export const getRelatedProducts =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid product ID.",
          });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Product not found.",
          });
      }

      // If category is inactive,
      // public related products also
      // should disappear.

      const category =
        await Category.findById(
          product.category
        );

      if (
        !category ||
        !category.isActive
      ) {
        return res
          .status(200)
          .json({
            success: true,
            count: 0,
            products: [],
          });
      }

      const relatedProducts =
        await Product.find({
          _id: {
            $ne:
              product._id,
          },

          category:
            product.category,

          isActive: true,
        })
          .select(
            "name slug price discountPrice images stock brand isFeatured"
          )
          .sort({
            createdAt: -1,
          })
          .limit(8);

      return res
        .status(200)
        .json({
          success: true,

          count:
            relatedProducts.length,

          products:
            relatedProducts,
        });
    } catch (error) {
      console.error(
        "Related Products Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Server error while fetching related products.",
        });
    }
  };