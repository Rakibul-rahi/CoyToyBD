import { useEffect, useMemo, useState } from "react";
import { uploadImageToCloudinary } from "../../services/cloudinary/cloudinaryService";
import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../../services/productService";

const FONT_LINK_ID = "coytoy-cyberpunk-fonts";
const MAX_IMAGES = 4;

function useInjectFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap";

    document.head.appendChild(link);
  }, []);
}

const KEYFRAMES = `
@keyframes coytoy-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes coytoy-pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(255, 63, 199, 0.45); }
  70% { box-shadow: 0 0 0 10px rgba(255, 63, 199, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 63, 199, 0); }
}
@keyframes coytoy-flicker-in {
  0% { opacity: 0; filter: brightness(2.5); }
  8% { opacity: 1; }
  10% { opacity: 0.4; }
  12% { opacity: 1; }
  100% { opacity: 1; filter: brightness(1); }
}
.coytoy-admin-root * {
  box-sizing: border-box;
}
.coytoy-admin-root *::selection {
  background: #ff3fc7;
  color: #06080f;
}
.coytoy-admin-input::placeholder,
.coytoy-admin-textarea::placeholder {
  color: #5b6390;
}
.coytoy-admin-input:focus,
.coytoy-admin-select:focus,
.coytoy-admin-textarea:focus {
  outline: none;
  border-color: #3fe3ff !important;
  box-shadow: 0 0 0 3px rgba(63, 227, 255, 0.18), 0 0 18px rgba(63, 227, 255, 0.25) !important;
}
.coytoy-admin-btn:focus-visible,
.coytoy-admin-input:focus-visible,
.coytoy-admin-select:focus-visible,
.coytoy-admin-textarea:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}
.coytoy-admin-panel,
.coytoy-admin-card {
  animation: coytoy-fade-up 0.45s ease both;
}
.coytoy-admin-card:hover {
  transform: translateY(-5px);
}
.coytoy-admin-card:hover .coytoy-admin-card-glow {
  opacity: 1;
}
.coytoy-admin-title {
  animation: coytoy-flicker-in 1.2s ease-out both;
}
@media (max-width: 900px) {
  .coytoy-admin-layout {
    grid-template-columns: 1fr !important;
  }
  .coytoy-admin-form {
    position: static !important;
  }
}
@media (max-width: 650px) {
  .coytoy-admin-header {
    padding: 40px 20px 28px !important;
  }
  .coytoy-admin-title {
    font-size: 34px !important;
  }
  .coytoy-admin-content {
    padding: 22px 18px 60px !important;
  }
  .coytoy-admin-stats {
    grid-template-columns: 1fr !important;
  }
}
`;

export default function AdminDashboard() {
  useInjectFonts();

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const categories = [
    "Cars",
    "Dolls",
    "Educational",
    "Action Figures",
    "Plush Toys",
    "Board Games",
  ];

  const loadProducts = async () => {
    setPageLoading(true);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const newImagePreviews = useMemo(() => {
    return imageFiles.map((file) => URL.createObjectURL(file));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.quantity) || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) => Number(product.quantity) > 0 && Number(product.quantity) <= 5
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.quantity) <= 0
  ).length;

  const formTitle = editingId ? "Edit Product" : "Add New Product";

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "11px",
    border: "1px solid #1c2340",
    background: "#0c1020",
    color: "#eef1fb",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("");
    setPrice("");
    setQuantity("");
    setDescription("");
    setImageFiles([]);
    setExistingImages([]);
  };

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const getProductImages = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.slice(0, MAX_IMAGES);
    }

    if (product.imageUrl) return [product.imageUrl];
    if (product.image) return [product.image];

    return [];
  };

  const getMainProductImage = (product) => {
    return getProductImages(product)[0] || "";
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const allowedFiles = selectedFiles.slice(0, MAX_IMAGES);

    if (selectedFiles.length > MAX_IMAGES) {
      alert(`You can upload maximum ${MAX_IMAGES} images per product.`);
    }

    setImageFiles(allowedFiles);
  };

  const removeSelectedImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !category || !price || quantity === "") {
      alert("Please fill name, category, price, and quantity");
      return;
    }

    if (!editingId && imageFiles.length === 0) {
      alert("Please select at least 1 product image");
      return;
    }

    if (editingId && existingImages.length === 0 && imageFiles.length === 0) {
      alert("Please keep or upload at least 1 product image");
      return;
    }

    try {
      setLoading(true);

      const uploadedImageUrls =
        imageFiles.length > 0
          ? await Promise.all(
              imageFiles.map((file) => uploadImageToCloudinary(file))
            )
          : [];

      const finalImages = editingId
        ? [...existingImages, ...uploadedImageUrls].slice(0, MAX_IMAGES)
        : uploadedImageUrls.slice(0, MAX_IMAGES);

      const productData = {
        name: name.trim(),
        category,
        price: Number(price),
        quantity: Number(quantity),
        description: description.trim(),
        images: finalImages,
        imageUrl: finalImages[0] || "",
      };

      if (editingId) {
        await updateProduct(editingId, productData);
        showNotice("Product updated successfully");
      } else {
        await addProduct(productData);
        showNotice("Product added successfully");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name || "");
    setCategory(product.category || "");
    setPrice(product.price || "");
    setQuantity(product.quantity || "");
    setDescription(product.description || "");
    setExistingImages(getProductImages(product));
    setImageFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      showNotice("Product deleted successfully");
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete product");
    }
  };

  return (
    <div
      className="coytoy-admin-root"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,63,199,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(63,227,255,0.10), transparent), #06080f",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#eef1fb",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{KEYFRAMES}</style>

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20% 30%, #ffffff 100%, transparent), radial-gradient(1px 1px at 75% 15%, #ffffff 100%, transparent), radial-gradient(1px 1px at 40% 70%, #ffffff 100%, transparent), radial-gradient(2px 2px at 85% 80%, #ffffff 100%, transparent), radial-gradient(1px 1px at 10% 85%, #ffffff 100%, transparent)",
          opacity: 0.45,
        }}
      />

      {notice && (
        <div
          style={{
            position: "fixed",
            top: "18px",
            right: "18px",
            zIndex: 20,
            padding: "13px 18px",
            borderRadius: "12px",
            background: "rgba(15,20,38,0.95)",
            border: "1px solid #3fe3ff",
            color: "#3fe3ff",
            fontWeight: 700,
            boxShadow: "0 0 24px rgba(63,227,255,0.35)",
          }}
        >
          {notice}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          className="coytoy-admin-header"
          style={{
            padding: "56px 32px 36px",
            borderBottom: "1px solid #1c2340",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#3fe3ff",
              letterSpacing: "5px",
              fontSize: "12px",
              fontWeight: 700,
              margin: "0 0 12px",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(63,227,255,0.7)",
            }}
          >
            Inventory Control
          </p>

          <h1
            className="coytoy-admin-title"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "48px",
              fontWeight: 800,
              letterSpacing: "3px",
              margin: 0,
              color: "#ff3fc7",
              textShadow:
                "0 0 8px rgba(255,63,199,0.9), 0 0 24px rgba(255,63,199,0.5)",
            }}
          >
            ADMIN DASHBOARD
          </h1>

          <p
            style={{
              margin: "16px auto 0",
              color: "#8993b8",
              maxWidth: "600px",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Add, update, and manage CoyToy products with up to 4 images per
            product.
          </p>
        </header>

        <main
          className="coytoy-admin-content"
          style={{
            padding: "30px 32px 80px",
            maxWidth: "1240px",
            marginInline: "auto",
          }}
        >
          <section
            className="coytoy-admin-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <StatCard title="Products" value={totalProducts} color="#3fe3ff" />
            <StatCard title="Total Stock" value={totalStock} color="#ff3fc7" />
            <StatCard title="Low Stock" value={lowStockCount} color="#ffb14e" />
            <StatCard
              title="Out of Stock"
              value={outOfStockCount}
              color="#ff4d6d"
            />
          </section>

          <section
            className="coytoy-admin-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "410px 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="coytoy-admin-panel coytoy-admin-form"
              style={{
                background: "rgba(15,20,38,0.72)",
                border: "1px solid #1c2340",
                borderRadius: "18px",
                padding: "20px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 0 35px rgba(0,0,0,0.35)",
                position: "sticky",
                top: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "19px",
                      letterSpacing: "1px",
                      margin: 0,
                      color: "#eef1fb",
                    }}
                  >
                    {formTitle}
                  </h2>

                  <p
                    style={{
                      color: "#5b6390",
                      fontSize: "13px",
                      margin: "6px 0 0",
                    }}
                  >
                    {editingId
                      ? "Update selected product details."
                      : "Create a new inventory item."}
                  </p>
                </div>

                {editingId && (
                  <span
                    style={{
                      color: "#ffb14e",
                      fontSize: "11px",
                      fontWeight: 800,
                      border: "1px solid #ffb14e",
                      borderRadius: "999px",
                      padding: "5px 9px",
                    }}
                  >
                    EDITING
                  </span>
                )}
              </div>

              <FormGroup label="Product Name">
                <input
                  className="coytoy-admin-input"
                  style={inputStyle}
                  type="text"
                  placeholder="Example: Cyber Racing Car"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Category">
                <select
                  className="coytoy-admin-select"
                  style={inputStyle}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      style={{ background: "#0c1020" }}
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <FormGroup label="Price">
                  <input
                    className="coytoy-admin-input"
                    style={inputStyle}
                    type="number"
                    placeholder="BDT"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </FormGroup>

                <FormGroup label="Quantity">
                  <input
                    className="coytoy-admin-input"
                    style={inputStyle}
                    type="number"
                    placeholder="Stock"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </FormGroup>
              </div>

              <FormGroup label="Description">
                <textarea
                  className="coytoy-admin-textarea"
                  style={{
                    ...inputStyle,
                    minHeight: "96px",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                  placeholder="Write a short product description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormGroup>

              <FormGroup
                label={
                  editingId
                    ? "Product Images — keep, remove, or add more"
                    : "Product Images — up to 4"
                }
              >
                {editingId && existingImages.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#5b6390",
                        fontSize: "12px",
                      }}
                    >
                      Current images
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                      }}
                    >
                      {existingImages.map((img, index) => (
                        <ImagePreviewBox
                          key={`${img}-${index}`}
                          src={img}
                          label={`Image ${index + 1}`}
                          onRemove={() => removeExistingImage(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <label
                  style={{
                    display: "block",
                    border: "1px dashed #1c2340",
                    borderRadius: "14px",
                    padding: "14px",
                    background: "#0c1020",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {newImagePreviews.length > 0 ? (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        {newImagePreviews.map((preview, index) => (
                          <ImagePreviewBox
                            key={preview}
                            src={preview}
                            label={`New ${index + 1}`}
                            onRemove={(e) => {
                              e.preventDefault();
                              removeSelectedImage(index);
                            }}
                          />
                        ))}
                      </div>

                      <strong style={{ color: "#3fe3ff" }}>
                        Click to change selected images
                      </strong>
                    </>
                  ) : (
                    <div
                      style={{
                        padding: "26px 10px",
                        color: "#8993b8",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                        🖼️
                      </div>

                      <strong style={{ color: "#3fe3ff" }}>
                        Click to upload images
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "12px",
                          color: "#5b6390",
                        }}
                      >
                        Select 1 to 4 JPG, PNG, or WEBP files
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#5b6390",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  First image will be used as the main product card image.
                </p>
              </FormGroup>

              <button
                type="submit"
                disabled={loading}
                className="coytoy-admin-btn"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "11px",
                  border: "1px solid #ff3fc7",
                  background: loading
                    ? "rgba(255,63,199,0.08)"
                    : "linear-gradient(135deg, rgba(255,63,199,0.24), rgba(63,227,255,0.14))",
                  color: loading ? "#8993b8" : "#ff3fc7",
                  fontSize: "14px",
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 0 20px rgba(255,63,199,0.25)",
                }}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="coytoy-admin-btn"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "12px",
                    borderRadius: "11px",
                    border: "1px solid #1c2340",
                    background: "transparent",
                    color: "#8993b8",
                    fontSize: "14px",
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <section
              className="coytoy-admin-panel"
              style={{
                background: "rgba(15,20,38,0.55)",
                border: "1px solid #1c2340",
                borderRadius: "18px",
                padding: "20px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "19px",
                      letterSpacing: "1px",
                      margin: 0,
                    }}
                  >
                    All Products
                  </h2>

                  <p
                    style={{
                      color: "#5b6390",
                      fontSize: "13px",
                      margin: "6px 0 0",
                    }}
                  >
                    {products.length} products in inventory
                  </p>
                </div>
              </div>

              {pageLoading ? (
                <div
                  style={{
                    padding: "70px 0",
                    textAlign: "center",
                    color: "#8993b8",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      margin: "0 auto 14px",
                      borderRadius: "50%",
                      border: "3px solid #1c2340",
                      borderTopColor: "#ff3fc7",
                      animation: "coytoy-pulse-ring 1.4s linear infinite",
                    }}
                  />

                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "70px 20px",
                    border: "1px dashed #1c2340",
                    borderRadius: "16px",
                    color: "#8993b8",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    📦
                  </div>

                  <h3 style={{ color: "#eef1fb", margin: "0 0 6px" }}>
                    No products added yet
                  </h3>

                  <p style={{ margin: 0, fontSize: "14px" }}>
                    Add your first CoyToy product from the form.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {products.map((product) => {
                    const qty = Number(product.quantity);
                    const outOfStock = qty <= 0;
                    const lowStock = qty > 0 && qty <= 5;
                    const productImages = getProductImages(product);
                    const mainImage = getMainProductImage(product);

                    return (
                      <div
                        key={product.id}
                        className="coytoy-admin-card"
                        style={{
                          position: "relative",
                          borderRadius: "16px",
                          transition: "transform 0.25s ease",
                        }}
                      >
                        <div
                          className="coytoy-admin-card-glow"
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: "-1px",
                            borderRadius: "16px",
                            background:
                              "linear-gradient(135deg, rgba(63,227,255,0.5), rgba(255,63,199,0.5))",
                            opacity: 0.22,
                            filter: "blur(6px)",
                            transition: "opacity 0.3s ease",
                            zIndex: 0,
                          }}
                        />

                        <div
                          style={{
                            position: "relative",
                            zIndex: 1,
                            background: "#0c1020",
                            border: "1px solid #1c2340",
                            borderRadius: "16px",
                            overflow: "hidden",
                            height: "100%",
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              height: "150px",
                              background: "#070a14",
                            }}
                          >
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={product.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  opacity: outOfStock ? 0.45 : 1,
                                  filter: outOfStock
                                    ? "grayscale(0.7)"
                                    : "none",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#5b6390",
                                  fontSize: "13px",
                                }}
                              >
                                No Image
                              </div>
                            )}

                            <span
                              style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                padding: "4px 8px",
                                borderRadius: "7px",
                                background: "rgba(6,8,15,0.75)",
                                border: "1px solid #1c2340",
                                color: "#3fe3ff",
                                fontSize: "10px",
                                fontWeight: 800,
                                letterSpacing: "0.8px",
                                textTransform: "uppercase",
                              }}
                            >
                              {product.category || "Unsorted"}
                            </span>

                            <span
                              style={{
                                position: "absolute",
                                right: "10px",
                                bottom: "10px",
                                padding: "4px 8px",
                                borderRadius: "999px",
                                background: "rgba(6,8,15,0.78)",
                                border: "1px solid #1c2340",
                                color: "#ff3fc7",
                                fontSize: "10px",
                                fontWeight: 800,
                              }}
                            >
                              {productImages.length} / 4 photos
                            </span>
                          </div>

                          {productImages.length > 1 && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "5px",
                                padding: "8px 8px 0",
                              }}
                            >
                              {productImages.slice(0, 4).map((img, index) => (
                                <img
                                  key={`${img}-${index}`}
                                  src={img}
                                  alt={`${product.name} ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "34px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    border: "1px solid #1c2340",
                                  }}
                                />
                              ))}
                            </div>
                          )}

                          <div style={{ padding: "14px" }}>
                            <h3
                              style={{
                                margin: "0 0 7px",
                                fontSize: "15px",
                                lineHeight: 1.3,
                              }}
                            >
                              {product.name}
                            </h3>

                            <p
                              style={{
                                margin: "0 0 12px",
                                color: "#8993b8",
                                fontSize: "12.5px",
                                lineHeight: 1.5,
                                minHeight: "38px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {product.description || "No description added."}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                              }}
                            >
                              <strong
                                style={{
                                  fontFamily: "'Orbitron', sans-serif",
                                  color: "#ff3fc7",
                                  fontSize: "16px",
                                  textShadow:
                                    "0 0 10px rgba(255,63,199,0.45)",
                                }}
                              >
                                {product.price} BDT
                              </strong>

                              <span
                                style={{
                                  color: outOfStock
                                    ? "#ff4d6d"
                                    : lowStock
                                    ? "#ffb14e"
                                    : "#3fe3ff",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                }}
                              >
                                {product.quantity} left
                              </span>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleEdit(product)}
                                className="coytoy-admin-btn"
                                style={{
                                  flex: 1,
                                  padding: "9px",
                                  borderRadius: "9px",
                                  border: "1px solid #3fe3ff",
                                  background: "rgba(63,227,255,0.1)",
                                  color: "#3fe3ff",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(product.id)}
                                className="coytoy-admin-btn"
                                style={{
                                  flex: 1,
                                  padding: "9px",
                                  borderRadius: "9px",
                                  border: "1px solid #ff4d6d",
                                  background: "rgba(255,77,109,0.08)",
                                  color: "#ff4d6d",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

function ImagePreviewBox({ src, label, onRemove }) {
  return (
    <div
      style={{
        position: "relative",
        height: "72px",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1c2340",
        background: "#070a14",
      }}
    >
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          border: "1px solid rgba(255,77,109,0.65)",
          background: "rgba(6,8,15,0.88)",
          color: "#ff4d6d",
          fontWeight: 900,
          lineHeight: 1,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label
        style={{
          display: "block",
          color: "#8993b8",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.7px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "rgba(15,20,38,0.72)",
        border: "1px solid #1c2340",
        borderRadius: "16px",
        padding: "17px",
        boxShadow: `0 0 22px ${color}22`,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#8993b8",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          margin: 0,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "26px",
          color,
          textShadow: `0 0 12px ${color}66`,
        }}
      >
        {value}
      </h3>
    </div>
  );
}