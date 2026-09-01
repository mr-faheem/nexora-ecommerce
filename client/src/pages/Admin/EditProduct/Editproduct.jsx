import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  X,
  ImagePlus,
  Trash2,
} from "lucide-react";

import api from "../../../api/axios";

import {
  getProductById,
  updateProduct,
  deleteProductImage,
} from "../../../services/productService";

function EditProduct() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    existingImages,
    setExistingImages,
  ] = useState([]);

  const [
    newImages,
    setNewImages,
  ] = useState([]);

  const [
    newImagePreviews,
    setNewImagePreviews,
  ] = useState([]);

  const [formData, setFormData] =
    useState({
      name: "",
      slug: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      stock: "",
      brand: "",
      isFeatured: false,
      isActive: true,
    });

  // ======================================================
  // Load Product + All Categories
  //
  // All categories intentionally:
  // Existing inactive category ko show karna hai.
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            productResponse,
            categoryResponse,
          ] =
            await Promise.all(
              [
                getProductById(
                  id
                ),

                api.get(
                  "/categories"
                ),
              ]
            );

          if (cancelled) {
            return;
          }

          const product =
            productResponse.product;

          setCategories(
            categoryResponse
              .data
              .categories || []
          );

          setExistingImages(
            product?.images ||
              []
          );

          setFormData({
            name:
              product?.name ||
              "",

            slug:
              product?.slug ||
              "",

            description:
              product?.description ||
              "",

            price:
              product?.price ??
              "",

            discountPrice:
              product?.discountPrice ??
              "",

            category:
              product?.category
                ?._id ||
              product?.category ||
              "",

            stock:
              product?.stock ??
              "",

            brand:
              product?.brand ||
              "",

            isFeatured:
              Boolean(
                product?.isFeatured
              ),

            isActive:
              product?.isActive !==
              false,
          });
        } catch (error) {
          console.error(
            "Load Edit Product Error:",
            error
          );

          if (!cancelled) {
            setError(
              error.response
                ?.data
                ?.message ||
                "Unable to load product."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(
              false
            );
          }
        }
      };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ======================================================
  // Cleanup New Image Previews
  // ======================================================

  useEffect(() => {
    return () => {
      newImagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview
          );
        }
      );
    };
  }, [newImagePreviews]);

  const generateSlug = (
    value
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );
  };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (name === "name") {
      setFormData(
        (previous) => ({
          ...previous,

          name: value,

          slug:
            generateSlug(
              value
            ),
        })
      );

      return;
    }

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  };

  const totalImages =
    existingImages.length +
    newImages.length;

  // ======================================================
  // Add New Images
  // ======================================================

  const handleNewImagesChange =
    (event) => {
      const selectedFiles =
        Array.from(
          event.target
            .files || []
        );

      if (
        selectedFiles.length ===
        0
      ) {
        return;
      }

      const remainingSlots =
        5 - totalImages;

      if (
        remainingSlots <= 0
      ) {
        setError(
          "Maximum 5 product images are allowed."
        );

        event.target.value =
          "";

        return;
      }

      const validFiles =
        selectedFiles
          .filter((file) =>
            file.type.startsWith(
              "image/"
            )
          )
          .slice(
            0,
            remainingSlots
          );

      const oversizedFile =
        validFiles.find(
          (file) =>
            file.size >
            10 *
              1024 *
              1024
        );

      if (oversizedFile) {
        setError(
          "Each image must be smaller than 10 MB."
        );

        event.target.value =
          "";

        return;
      }

      if (
        selectedFiles.length >
        remainingSlots
      ) {
        setError(
          `Only ${remainingSlots} more image(s) can be added. Maximum 5 images are allowed.`
        );
      } else {
        setError("");
      }

      const previews =
        validFiles.map(
          (file) =>
            URL.createObjectURL(
              file
            )
        );

      setNewImages(
        (previous) => [
          ...previous,
          ...validFiles,
        ]
      );

      setNewImagePreviews(
        (previous) => [
          ...previous,
          ...previews,
        ]
      );

      event.target.value =
        "";
    };

  const removeNewImage = (
    index
  ) => {
    URL.revokeObjectURL(
      newImagePreviews[index]
    );

    setNewImages(
      (previous) =>
        previous.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        )
    );

    setNewImagePreviews(
      (previous) =>
        previous.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        )
    );
  };

  // ======================================================
  // Delete Existing Cloudinary Image
  // ======================================================

  const handleDeleteExistingImage =
    async (image) => {
      const confirmed =
        window.confirm(
          "Delete this image permanently?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        setDeletingImageId(
          image.publicId
        );

        const data =
          await deleteProductImage(
            id,
            image.publicId
          );

        setExistingImages(
          data.product
            ?.images ||
            data.images ||
            existingImages.filter(
              (
                currentImage
              ) =>
                currentImage.publicId !==
                image.publicId
            )
        );

        setMessage(
          data.message ||
            "Image deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete Product Image Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to delete image."
        );
      } finally {
        setDeletingImageId(
          ""
        );
      }
    };

  // ======================================================
  // Update Product
  // ======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      setError("");
      setMessage("");

      if (
        !formData.name.trim() ||
        !formData.slug.trim() ||
        !formData.description.trim() ||
        !formData.price ||
        !formData.category
      ) {
        setError(
          "Name, slug, description, price and category are required."
        );

        return;
      }

      if (
        Number(
          formData.price
        ) < 0
      ) {
        setError(
          "Price cannot be negative."
        );

        return;
      }

      if (
        formData.discountPrice &&
        Number(
          formData.discountPrice
        ) >
          Number(
            formData.price
          )
      ) {
        setError(
          "Discount price cannot be greater than original price."
        );

        return;
      }

      const payload =
        new FormData();

      payload.append(
        "name",
        formData.name.trim()
      );

      payload.append(
        "slug",
        formData.slug.trim()
      );

      payload.append(
        "description",
        formData.description.trim()
      );

      payload.append(
        "price",
        formData.price
      );

      payload.append(
        "discountPrice",
        formData.discountPrice ||
          "0"
      );

      payload.append(
        "category",
        formData.category
      );

      payload.append(
        "stock",
        formData.stock ||
          "0"
      );

      payload.append(
        "brand",
        formData.brand.trim()
      );

      payload.append(
        "isFeatured",
        String(
          formData.isFeatured
        )
      );

      payload.append(
        "isActive",
        String(
          formData.isActive
        )
      );

      newImages.forEach(
        (image) => {
          payload.append(
            "images",
            image
          );
        }
      );

      const data =
        await updateProduct(
          id,
          payload
        );

      setMessage(
        data.message ||
          "Product updated successfully."
      );

      setTimeout(() => {
        navigate(
          "/admin/products"
        );
      }, 700);
    } catch (error) {
      console.error(
        "Update Product Error:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "Unable to update product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  // Active categories +
  // currently selected category
  const availableCategories =
    categories.filter(
      (category) =>
        category.isActive ||
        category._id ===
          formData.category
    );

  return (
    <div className="p-8">
      <div className="max-w-5xl">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Products
        </p>

        <h1 className="text-4xl font-bold mt-3">
          Edit Product
        </h1>

        <p className="text-gray-600 mt-3">
          Update product
          information and manage
          images.
        </p>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 border border-green-200 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 bg-white border rounded-xl p-6 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Slug
              </label>

              <input
                type="text"
                name="slug"
                value={
                  formData.slug
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              rows="5"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">
                Price
              </label>

              <input
                type="number"
                min="0"
                name="price"
                value={
                  formData.price
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Discount Price
              </label>

              <input
                type="number"
                min="0"
                name="discountPrice"
                value={
                  formData.discountPrice
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">
                Category
              </label>

              <select
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:border-black"
              >
                <option value="">
                  Select category
                </option>

                {availableCategories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {
                        category.name
                      }
                      {!category.isActive
                        ? " (Inactive)"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Stock
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={
                  formData.stock
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Brand
            </label>

            <input
              type="text"
              name="brand"
              value={
                formData.brand
              }
              onChange={
                handleChange
              }
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="border-t pt-6 flex flex-wrap gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={
                  formData.isFeatured
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Featured Product
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={
                  formData.isActive
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Active Product
              </span>
            </label>
          </div>

          {/* Product Images */}

          <div className="border-t pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  Product Images
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Existing and new
                  images. Maximum 5
                  total images.
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {totalImages}/5
              </span>
            </div>

            {/* Existing */}

            {existingImages.length >
              0 && (
              <div className="mt-6">
                <p className="font-medium mb-3">
                  Existing Images
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {existingImages.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={
                          image.publicId
                        }
                        className="relative aspect-square rounded-xl overflow-hidden border bg-gray-100"
                      >
                        <img
                          src={
                            image.url
                          }
                          alt={`Product ${
                            index +
                            1
                          }`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          disabled={
                            deletingImageId ===
                            image.publicId
                          }
                          onClick={() =>
                            handleDeleteExistingImage(
                              image
                            )
                          }
                          className="absolute top-2 right-2 w-9 h-9 bg-black rounded-full flex items-center justify-center disabled:opacity-50"
                          style={{
                            color:
                              "#ffffff",
                          }}
                        >
                          {deletingImageId ===
                          image.publicId ? (
                            <span className="text-xs">
                              ...
                            </span>
                          ) : (
                            <Trash2
                              size={
                                16
                              }
                            />
                          )}
                        </button>

                        {index ===
                          0 && (
                          <span className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* New */}

            {newImagePreviews.length >
              0 && (
              <div className="mt-6">
                <p className="font-medium mb-3">
                  New Images
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {newImagePreviews.map(
                    (
                      preview,
                      index
                    ) => (
                      <div
                        key={
                          preview
                        }
                        className="relative aspect-square rounded-xl overflow-hidden border bg-gray-100"
                      >
                        <img
                          src={
                            preview
                          }
                          alt={`New Preview ${
                            index +
                            1
                          }`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(
                              index
                            )
                          }
                          className="absolute top-2 right-2 w-9 h-9 bg-black rounded-full flex items-center justify-center"
                          style={{
                            color:
                              "#ffffff",
                          }}
                        >
                          <X
                            size={
                              17
                            }
                          />
                        </button>

                        <span className="absolute bottom-2 left-2 bg-white text-black text-xs px-2 py-1 rounded shadow">
                          New
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <label
              className={`mt-6 border-2 border-dashed rounded-xl min-h-32 flex flex-col items-center justify-center transition ${
                totalImages >= 5
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
            >
              <ImagePlus
                size={30}
              />

              <span className="font-medium mt-2">
                Add New Images
              </span>

              <span className="text-sm text-gray-500 mt-1">
                JPG, PNG, WEBP
              </span>

              <input
                type="file"
                multiple
                accept="image/*"
                disabled={
                  totalImages >= 5
                }
                onChange={
                  handleNewImagesChange
                }
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={
                submitting
              }
              className="bg-black px-7 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
              style={{
                color:
                  "#ffffff",
              }}
            >
              {submitting
                ? "Updating..."
                : "Update Product"}
            </button>

            <button
              type="button"
              disabled={
                submitting
              }
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
              className="border border-black px-7 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;