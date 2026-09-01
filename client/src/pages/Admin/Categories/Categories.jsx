import {
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  Plus,
  Pencil,
  Save,
  X,
  ImagePlus,
  ImageOff,
} from "lucide-react";

import api from "../../../api/axios";

function Categories() {
  const [
    categories,
    setCategories,
  ] = useState([]);

  // ======================================================
  // CREATE STATE
  // ======================================================

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState("");

  const [
    createMessage,
    setCreateMessage,
  ] = useState("");

  const [
    loadError,
    setLoadError,
  ] = useState("");

  // ======================================================
  // DELETE STATE
  // ======================================================

  const [
    deleteErrors,
    setDeleteErrors,
  ] = useState({});

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  // ======================================================
  // EDIT STATE
  // ======================================================

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editIsActive,
    setEditIsActive,
  ] = useState(true);

  const [
    editImageFile,
    setEditImageFile,
  ] = useState(null);

  const [
    editImagePreview,
    setEditImagePreview,
  ] = useState("");

  const [
    removeExistingImage,
    setRemoveExistingImage,
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    updateErrors,
    setUpdateErrors,
  ] = useState({});

  const [
    updateMessages,
    setUpdateMessages,
  ] = useState({});

  // ======================================================
  // Slug
  // ======================================================

  const generateSlug = (
    value = ""
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

  // ======================================================
  // Fetch Categories
  // ======================================================

  const fetchCategories =
    async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response =
          await api.get(
            "/categories"
          );

        setCategories(
          response.data
            .categories || []
        );
      } catch (error) {
        console.error(
          "Fetch Categories Error:",
          error
        );

        setLoadError(
          error.response?.data
            ?.message ||
            "Unable to load categories."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ======================================================
  // Create Image
  // ======================================================

  const handleCreateImage =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setCreateError(
          "Please select a valid image."
        );

        return;
      }

      setImageFile(file);

      setImagePreview(
        URL.createObjectURL(
          file
        )
      );

      setCreateError("");
      setCreateMessage("");
    };

  const clearCreateImage =
    () => {
      setImageFile(null);

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImagePreview("");
    };

  // ======================================================
  // Create Category
  // ======================================================

  const handleCreateCategory =
    async (event) => {
      event.preventDefault();

      try {
        setCreating(true);

        setCreateError("");
        setCreateMessage("");

        if (!name.trim()) {
          setCreateError(
            "Category name is required."
          );

          return;
        }

        const formData =
          new FormData();

        formData.append(
          "name",
          name.trim()
        );

        formData.append(
          "slug",
          generateSlug(name)
        );

        formData.append(
          "description",
          description.trim()
        );

        formData.append(
          "isActive",
          "true"
        );

        if (imageFile) {
          formData.append(
            "image",
            imageFile
          );
        }

        const response =
          await api.post(
            "/categories",
            formData
          );

        setCreateMessage(
          response.data
            .message ||
            "Category created successfully."
        );

        setName("");
        setDescription("");

        clearCreateImage();

        await fetchCategories();
      } catch (error) {
        console.error(
          "Create Category Error:",
          error
        );

        setCreateError(
          error.response?.data
            ?.message ||
            "Unable to create category."
        );
      } finally {
        setCreating(false);
      }
    };

  // ======================================================
  // Start Edit
  // ======================================================

  const handleStartEdit = (
    category
  ) => {
    setEditingId(
      category._id
    );

    setEditName(
      category.name || ""
    );

    setEditDescription(
      category.description ||
        ""
    );

    setEditIsActive(
      category.isActive
    );

    setEditImageFile(null);

    setEditImagePreview(
      category.image || ""
    );

    setRemoveExistingImage(
      false
    );

    setUpdateErrors(
      (current) => ({
        ...current,

        [category._id]:
          "",
      })
    );

    setUpdateMessages(
      (current) => ({
        ...current,

        [category._id]:
          "",
      })
    );

    setDeleteErrors(
      (current) => ({
        ...current,

        [category._id]:
          "",
      })
    );
  };

  // ======================================================
  // Cancel Edit
  // ======================================================

  const handleCancelEdit =
    () => {
      setEditingId(null);

      setEditName("");
      setEditDescription("");
      setEditIsActive(true);

      setEditImageFile(null);
      setEditImagePreview("");

      setRemoveExistingImage(
        false
      );
    };

  // ======================================================
  // Edit Image
  // ======================================================

  const handleEditImage =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        return;
      }

      setEditImageFile(file);

      setEditImagePreview(
        URL.createObjectURL(
          file
        )
      );

      setRemoveExistingImage(
        false
      );
    };

  const handleRemoveEditImage =
    () => {
      setEditImageFile(null);

      setEditImagePreview("");

      setRemoveExistingImage(
        true
      );
    };

  // ======================================================
  // Update Category
  // ======================================================

  const handleUpdateCategory =
    async (categoryId) => {
      try {
        setUpdatingId(
          categoryId
        );

        setUpdateErrors(
          (current) => ({
            ...current,

            [categoryId]:
              "",
          })
        );

        setUpdateMessages(
          (current) => ({
            ...current,

            [categoryId]:
              "",
          })
        );

        if (
          !editName.trim()
        ) {
          setUpdateErrors(
            (current) => ({
              ...current,

              [categoryId]:
                "Category name is required.",
            })
          );

          return;
        }

        const formData =
          new FormData();

        formData.append(
          "name",
          editName.trim()
        );

        formData.append(
          "slug",
          generateSlug(
            editName
          )
        );

        formData.append(
          "description",
          editDescription.trim()
        );

        formData.append(
          "isActive",
          String(
            editIsActive
          )
        );

        formData.append(
          "removeImage",
          String(
            removeExistingImage
          )
        );

        if (editImageFile) {
          formData.append(
            "image",
            editImageFile
          );
        }

        const response =
          await api.put(
            `/categories/${categoryId}`,
            formData
          );

        const updatedCategory =
          response.data
            .category;

        setCategories(
          (current) =>
            current.map(
              (category) =>
                category._id ===
                categoryId
                  ? updatedCategory
                  : category
            )
        );

        setUpdateMessages(
          (current) => ({
            ...current,

            [categoryId]:
              response.data
                .message ||
              "Category updated successfully.",
          })
        );

        setEditingId(null);

        setEditName("");
        setEditDescription("");
        setEditIsActive(true);

        setEditImageFile(null);
        setEditImagePreview("");

        setRemoveExistingImage(
          false
        );
      } catch (error) {
        console.error(
          "Update Category Error:",
          error
        );

        setUpdateErrors(
          (current) => ({
            ...current,

            [categoryId]:
              error.response?.data
                ?.message ||
              "Unable to update category.",
          })
        );
      } finally {
        setUpdatingId(null);
      }
    };

  // ======================================================
  // Delete
  // ======================================================

  const handleDeleteCategory =
    async (categoryId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this category?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          categoryId
        );

        setDeleteErrors(
          (current) => ({
            ...current,

            [categoryId]:
              "",
          })
        );

        setUpdateErrors(
          (current) => ({
            ...current,

            [categoryId]:
              "",
          })
        );

        setUpdateMessages(
          (current) => ({
            ...current,

            [categoryId]:
              "",
          })
        );

        await api.delete(
          `/categories/${categoryId}`
        );

        setCategories(
          (current) =>
            current.filter(
              (category) =>
                category._id !==
                categoryId
            )
        );

        if (
          editingId ===
          categoryId
        ) {
          handleCancelEdit();
        }
      } catch (error) {
        console.error(
          "Delete Category Error:",
          error
        );

        setDeleteErrors(
          (current) => ({
            ...current,

            [categoryId]:
              error.response?.data
                ?.message ||
              "Unable to delete category.",
          })
        );
      } finally {
        setDeletingId(null);
      }
    };

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Store Management
        </p>

        <h1 className="text-4xl font-bold mt-3">
          Categories
        </h1>

        <p className="text-gray-600 mt-3">
          Create and manage
          product categories and
          collection posters.
        </p>

        {loadError && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {loadError}
          </div>
        )}

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 mt-8">
          {/* ================================================= */}
          {/* ADD CATEGORY */}
          {/* ================================================= */}

          <div className="bg-white border rounded-xl p-6 h-fit">
            <h2 className="text-xl font-bold">
              Add Category
            </h2>

            <form
              onSubmit={
                handleCreateCategory
              }
              className="mt-6 space-y-5"
            >
              <div>
                <label className="block font-medium mb-2">
                  Category Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(
                    event
                  ) => {
                    setName(
                      event.target
                        .value
                    );

                    setCreateError(
                      ""
                    );

                    setCreateMessage(
                      ""
                    );
                  }}
                  placeholder="Women"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Slug
                </label>

                <input
                  type="text"
                  value={generateSlug(
                    name
                  )}
                  readOnly
                  placeholder="women"
                  className="w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) => {
                    setDescription(
                      event.target
                        .value
                    );

                    setCreateError(
                      ""
                    );

                    setCreateMessage(
                      ""
                    );
                  }}
                  rows="4"
                  placeholder="Women's fashion collection..."
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black resize-none"
                />
              </div>

              {/* Poster */}

              <div>
                <label className="block font-medium mb-2">
                  Category Poster
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border bg-gray-100 aspect-[4/3]">
                    <img
                      src={
                        imagePreview
                      }
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={
                        clearCreateImage
                      }
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                    >
                      <X
                        size={18}
                      />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-xl min-h-36 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                    <ImagePlus
                      size={28}
                    />

                    <span className="mt-3 text-sm font-medium">
                      Upload Poster
                    </span>

                    <span className="text-xs text-gray-500 mt-1">
                      JPG, PNG or WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleCreateImage
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              {createMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {
                    createMessage
                  }
                </div>
              )}

              <button
                type="submit"
                disabled={
                  creating
                }
                className="w-full bg-black !text-white rounded-lg px-5 py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus
                  size={18}
                />

                {creating
                  ? "Creating..."
                  : "Add Category"}
              </button>
            </form>
          </div>

          {/* ================================================= */}
          {/* CATEGORY LIST */}
          {/* ================================================= */}

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-bold">
                All Categories
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {
                  categories.length
                }{" "}
                {categories.length ===
                1
                  ? "category"
                  : "categories"}
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-gray-500">
                Loading
                categories...
              </div>
            ) : categories.length ===
              0 ? (
              <div className="p-8 text-gray-500">
                No categories
                found.
              </div>
            ) : (
              <div className="divide-y">
                {categories.map(
                  (category) => {
                    const isEditing =
                      editingId ===
                      category._id;

                    return (
                      <div
                        key={
                          category._id
                        }
                        className="px-6 py-5"
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            {/* Existing image */}

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Category
                                Poster
                              </label>

                              {editImagePreview ? (
                                <div className="relative rounded-xl overflow-hidden bg-gray-100 border aspect-[16/7]">
                                  <img
                                    src={
                                      editImagePreview
                                    }
                                    alt={
                                      editName
                                    }
                                    className="w-full h-full object-cover"
                                  />

                                  <button
                                    type="button"
                                    onClick={
                                      handleRemoveEditImage
                                    }
                                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                                  >
                                    <ImageOff
                                      size={
                                        17
                                      }
                                    />
                                  </button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed rounded-xl p-6 text-center text-gray-500">
                                  No poster
                                  selected
                                </div>
                              )}

                              <label className="mt-3 inline-flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
                                <ImagePlus
                                  size={
                                    17
                                  }
                                />

                                {editImagePreview
                                  ? "Replace Poster"
                                  : "Add Poster"}

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={
                                    handleEditImage
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Category
                                Name
                              </label>

                              <input
                                type="text"
                                value={
                                  editName
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditName(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Slug
                              </label>

                              <input
                                type="text"
                                value={generateSlug(
                                  editName
                                )}
                                readOnly
                                className="w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Description
                              </label>

                              <textarea
                                value={
                                  editDescription
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditDescription(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                rows="3"
                                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black resize-none"
                              />
                            </div>

                            {/* Status */}

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Status
                              </label>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditIsActive(
                                      true
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg border text-sm transition ${
                                    editIsActive
                                      ? "bg-black !text-white border-black"
                                      : "bg-white text-black"
                                  }`}
                                >
                                  Active
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditIsActive(
                                      false
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg border text-sm transition ${
                                    !editIsActive
                                      ? "bg-black !text-white border-black"
                                      : "bg-white text-black"
                                  }`}
                                >
                                  Inactive
                                </button>
                              </div>
                            </div>

                            {updateErrors[
                              category
                                ._id
                            ] && (
                              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {
                                  updateErrors[
                                    category
                                      ._id
                                  ]
                                }
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  category._id
                                }
                                onClick={() =>
                                  handleUpdateCategory(
                                    category._id
                                  )
                                }
                                className="bg-black !text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:bg-gray-400"
                              >
                                <Save
                                  size={
                                    17
                                  }
                                />

                                {updatingId ===
                                category._id
                                  ? "Saving..."
                                  : "Save Changes"}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  category._id
                                }
                                onClick={
                                  handleCancelEdit
                                }
                                className="border px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-100"
                              >
                                <X
                                  size={
                                    17
                                  }
                                />

                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-4">
                              {/* Thumbnail */}

                              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                {category.image ? (
                                  <img
                                    src={
                                      category.image
                                    }
                                    alt={
                                      category.name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageOff
                                      size={
                                        24
                                      }
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {
                                        category.name
                                      }
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                      /
                                      {
                                        category.slug
                                      }
                                    </p>

                                    {category.description && (
                                      <p className="text-sm text-gray-500 mt-2">
                                        {
                                          category.description
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`text-xs px-3 py-1 rounded-full ${
                                        category.isActive
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-200 text-gray-600"
                                      }`}
                                    >
                                      {category.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartEdit(
                                          category
                                        )
                                      }
                                      className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                                      title="Edit category"
                                    >
                                      <Pencil
                                        size={
                                          17
                                        }
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        deletingId ===
                                        category._id
                                      }
                                      onClick={() =>
                                        handleDeleteCategory(
                                          category._id
                                        )
                                      }
                                      className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                                      title="Delete category"
                                    >
                                      <Trash2
                                        size={
                                          17
                                        }
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {updateMessages[
                              category
                                ._id
                            ] && (
                              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                {
                                  updateMessages[
                                    category
                                      ._id
                                  ]
                                }
                              </div>
                            )}

                            {updateErrors[
                              category
                                ._id
                            ] && (
                              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {
                                  updateErrors[
                                    category
                                      ._id
                                  ]
                                }
                              </div>
                            )}

                            {deleteErrors[
                              category
                                ._id
                            ] && (
                              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {
                                  deleteErrors[
                                    category
                                      ._id
                                  ]
                                }
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;