import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  X,
  ImagePlus,
} from "lucide-react";

import api from "../../../api/axios";

import {
  createProduct,
} from "../../../services/productService";

function AddProduct() {
  const navigate = useNavigate();

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [images, setImages] =
    useState([]);

  const [
    imagePreviews,
    setImagePreviews,
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
  // Load ONLY active categories
  // ======================================================

  useEffect(() => {
  const fetchCategories =
    async () => {
      try {
        setLoadingCategories(
          true
        );

        const response =
          await api.get(
            "/categories?active=true"
          );

        const activeCategories = (
          response.data
            .categories || []
        ).filter(
          (category) =>
            category.isActive ===
            true
        );

        setCategories(
          activeCategories
        );
      } catch (error) {
        console.error(
          "Fetch Categories Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to load categories."
        );
      } finally {
        setLoadingCategories(
          false
        );
      }
    };

  fetchCategories();
}, []); 

  // ======================================================
  // Image Preview Cleanup
  // ======================================================

  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview
          );
        }
      );
    };
  }, [imagePreviews]);

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
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(
          value
        ),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ======================================================
  // Select Images
  // ======================================================

  const handleImagesChange = (
    event
  ) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const remainingSlots =
      5 - images.length;

    if (remainingSlots <= 0) {
      setError(
        "Maximum 5 product images are allowed."
      );

      event.target.value = "";
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
          10 * 1024 * 1024
      );

    if (oversizedFile) {
      setError(
        "Each image must be smaller than 10 MB."
      );

      event.target.value = "";
      return;
    }

    if (
      selectedFiles.length >
      remainingSlots
    ) {
      setError(
        `Only ${remainingSlots} more image(s) can be selected. Maximum 5 images are allowed.`
      );
    } else {
      setError("");
    }

    const newPreviews =
      validFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    setImagePreviews(
      (prev) => [
        ...prev,
        ...newPreviews,
      ]
    );

    event.target.value = "";
  };

  const removeImage = (
    index
  ) => {
    URL.revokeObjectURL(
      imagePreviews[index]
    );

    setImages((prev) =>
      prev.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );

    setImagePreviews(
      (prev) =>
        prev.filter(
          (_, currentIndex) =>
            currentIndex !==
            index
        )
    );
  };

  // ======================================================
  // Create Product
  // ======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

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

      images.forEach(
        (image) => {
          payload.append(
            "images",
            image
          );
        }
      );

      const data =
        await createProduct(
          payload
        );

      setMessage(
        data.message ||
          "Product created successfully."
      );

      setTimeout(() => {
        navigate(
          "/admin/products"
        );
      }, 800);
    } catch (error) {
      console.error(
        "Create Product Error:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "Unable to create product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Products
        </p>

        <h1 className="text-4xl font-bold mt-3">
          Add Product
        </h1>

        <p className="text-gray-600 mt-3">
          Create a new product for
          the Nexora store.
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
                placeholder="Premium Black T-Shirt"
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
                placeholder="premium-black-t-shirt"
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
              placeholder="Enter product description..."
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
                name="price"
                min="0"
                value={
                  formData.price
                }
                onChange={
                  handleChange
                }
                placeholder="1299"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Discount Price
              </label>

              <input
                type="number"
                name="discountPrice"
                min="0"
                value={
                  formData.discountPrice
                }
                onChange={
                  handleChange
                }
                placeholder="999"
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
                disabled={
                  loadingCategories
                }
                className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:border-black"
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories.map(
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
                    </option>
                  )
                )}
              </select>

              {!loadingCategories &&
                categories.length ===
                  0 && (
                  <p className="text-sm text-red-600 mt-2">
                    No active
                    categories
                    available.
                  </p>
                )}
            </div>

            <div>
              <label className="block font-medium mb-2">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                value={
                  formData.stock
                }
                onChange={
                  handleChange
                }
                placeholder="50"
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
              placeholder="Nexora"
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

          {/* Images */}

          <div className="border border-dashed rounded-xl p-6 bg-gray-50">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-semibold text-lg">
                  Product Images
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Upload up to 5
                  product images.
                  Maximum size 10 MB
                  each.
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {images.length}
                /5
              </span>
            </div>

            <label
              className={`mt-5 border-2 border-dashed rounded-xl min-h-32 flex flex-col items-center justify-center cursor-pointer transition ${
                images.length >=
                5
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white"
              }`}
            >
              <ImagePlus
                size={30}
                className="mb-2"
              />

              <span className="font-medium">
                Choose Images
              </span>

              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG, WEBP
              </span>

              <input
                type="file"
                multiple
                accept="image/*"
                disabled={
                  images.length >=
                  5
                }
                onChange={
                  handleImagesChange
                }
                className="hidden"
              />
            </label>

            {imagePreviews.length >
              0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                {imagePreviews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={
                        preview
                      }
                      className="relative aspect-square rounded-lg overflow-hidden border bg-white"
                    >
                      <img
                        src={
                          preview
                        }
                        alt={`Preview ${
                          index +
                          1
                        }`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black flex items-center justify-center shadow"
                        style={{
                          color:
                            "#ffffff",
                        }}
                      >
                        <X
                          size={
                            16
                          }
                        />
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
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={
                submitting ||
                loadingCategories ||
                categories.length ===
                  0
              }
              className="bg-black px-7 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
              style={{
                color:
                  "#ffffff",
              }}
            >
              {submitting
                ? "Creating..."
                : "Create Product"}
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

export default AddProduct;