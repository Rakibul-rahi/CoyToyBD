# CoyToy BD

## Table of Contents

- [Project Description](#-project-description)
- [Project Features](#-project-features)
- [Objectives](#-objectives)
- [Target Audience](#-target-audience)
- [API / Firebase Services](#-api--firebase-services)
- [Milestones](#-milestones)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [Team Members](#-team-members)
- [Live Project & Mock UI](#-live-project--mock-ui)

---

## 📝 Project Description

**CoyToy BD** is an online toyshop web application designed for showcasing and selling toys through a modern and responsive website. The platform allows customers to browse products, search and filter items, view product details, add products to cart, and place orders through the cart system.

The project also includes an **Admin Dashboard** where the admin can manage products, upload product images, update stock status, and maintain the product catalog. The system uses **React + Vite** for the frontend, **Firebase Authentication and Firestore** for authentication and database management, and **Cloudinary** for product image hosting.

---

## 💡 Project Features

### i. User Authentication and Authorization

- Admin login system using Firebase Authentication.
- Protected admin routes.
- Only authorized admin can access the admin dashboard.
- Secure logout functionality.

### ii. Product Management

- Admin can add new toy products.
- Admin can update existing product details.
- Admin can delete products.
- Products include name, category, price, quantity, description, images, and stock status.
- Stock status supports:
  - Available
  - Limited Stock
  - Out of Stock

### iii. Product Image Management

- Product images are uploaded using Cloudinary.
- Cloudinary upload preset is restricted for safer image upload.
- Supported image formats include JPG, JPEG, PNG, and WEBP.
- Product image URLs are stored in Firestore.

### iv. Customer Product Browsing

- Customers can view all available products.
- Products are displayed in a clean card-based layout.
- Product detail page is available for individual products.
- Customers can search products by name.
- Customers can filter products by category and price range.

### v. Cart and Checkout System

- Customers can add products to cart.
- Cart page shows selected products, quantity, and total price.
- Checkout button takes the customer to the cart page.
- Products can only be ordered through the cart flow.
- WhatsApp checkout is used to send the order details to the shop owner.

### vi. Admin Dashboard

- Admin can view all products.
- Admin can filter products by stock status.
- Clicking **Limited Stock** shows limited stock items.
- Clicking **Out of Stock** shows out of stock items.
- Dashboard uses a professional UI with a separate admin design style.

### vii. Responsive Design

- Website is responsive for desktop, tablet, and mobile devices.
- Navbar is mobile-friendly.
- Product cards and layout adjust according to screen size.

---

## 🎯 Objectives

- **Create a Digital Toy Store:** Build an online platform where customers can browse and order toys easily.
- **Simplify Product Management:** Provide an admin dashboard for managing product information and stock.
- **Improve Customer Experience:** Allow users to search, filter, view details, add to cart, and checkout smoothly.
- **Secure Admin Access:** Protect admin-only pages using Firebase Authentication and Firestore security rules.
- **Use Scalable Cloud Services:** Store product data in Firestore and product images in Cloudinary.
- **Build a Real-World E-commerce Project:** Develop a practical toyshop website suitable for deployment and client use.

---

## 👥 Target Audience

- Parents looking for toys for children.
- Customers who want to browse toys online before ordering.
- Small toyshop owners who want a simple e-commerce website.
- Local customers who prefer ordering through WhatsApp.
- Admin/shop owner who needs an easy product management dashboard.

---

## 📜 API / Firebase Services

> This project uses Firebase and Cloudinary instead of a traditional REST API backend.

### Authentication

- **Firebase Authentication**
  - Admin login using email and password.
  - Admin logout.
  - Protected route checking for dashboard access.

### Products Collection

Firestore collection: `products`

#### Product Fields

```js
{
  name: string,
  category: string,
  price: number,
  quantity: number,
  description: string,
  images: array,
  imageUrl: string,
  imagePublicId: string,
  status: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Product Operations

- `getProducts()`
  - Fetch all products from Firestore.

- `addProduct(productData)`
  - Add a new product.
  - Admin only.

- `updateProduct(productId, updatedData)`
  - Update an existing product.
  - Admin only.

- `deleteProduct(productId)`
  - Delete a product.
  - Admin only.

### Cloudinary Image Upload

- Upload product images to Cloudinary.
- Store uploaded image URL in Firestore.
- Restrict upload preset with:
  - Allowed formats: JPG, JPEG, PNG, WEBP
  - Folder: `coytoybd/products`
  - Unique filename enabled
  - Overwrite disabled

### Cart System

- Add product to cart.
- Update cart quantity.
- Remove product from cart.
- Calculate total price.
- Checkout through WhatsApp message.

### WhatsApp Checkout

- Sends customer order summary to the configured WhatsApp number.
- Order message includes product name, quantity, price, and total amount.

---

## 📝 Milestones

### Milestone 1: Initial Setup and Basic Features

- Set up React + Vite project.
- Set up Firebase configuration.
- Create homepage.
- Create product card UI.
- Create basic navbar.
- Create Firebase Authentication for admin login.
- Create protected route for admin dashboard.

### Milestone 2: Product Management and Storefront

- Create product service for Firestore operations.
- Add product upload functionality.
- Add Cloudinary image upload.
- Display products on homepage.
- Add search functionality.
- Add category and price filtering.
- Create product details page.

### Milestone 3: Cart and Checkout System

- Create cart context.
- Add products to cart.
- Create cart page.
- Add quantity update option.
- Add checkout button.
- Connect checkout with WhatsApp.
- Remove direct WhatsApp order from product details page.

### Milestone 4: Admin Dashboard Improvements

- Improve admin dashboard UI.
- Add stock status filtering.
- Add Limited Stock and Out of Stock views.
- Add professional dashboard background and styling.
- Add admin product update/delete features.

### Milestone 5: Security and Deployment

- Restrict Firebase Firestore rules.
- Restrict Cloudinary upload preset.
- Move environment variables to `.env`.
- Deploy frontend.
- Connect custom domain.
- Test website on mobile and desktop.
- Final bug fixes.

---

## 💻 Technologies Used

| Category | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Styling | CSS / Inline Styling |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| Image Hosting | Cloudinary |
| Routing | React Router DOM |
| State Management | React Context API |
| Checkout | WhatsApp |
| Version Control | Git |
| Repository | GitHub |
| Deployment | Netlify |
| Rendering Method | Client-Side Rendering (CSR) |

---

## 🚧 Installation

### Prerequisites

Before running this project, make sure you have installed:

- Node.js
- npm
- Git
- Firebase project
- Cloudinary account

---

## 👷 Team Members

| ID | Name | Email | GitHub | Role |
|---|---|---|---|---|
| 20210204077 | Rakibul Islam Rahi | rakibulislam.rahi.rir@gmail.com | Rakibul-rahi | Frontend + Backend |

---

## ✔️ Live Project & Mock UI

**Live Project Link:** (https://coytoybd.netlify.app/)

---

## 📌 Future Improvements

- Add customer login system.
- Add online payment gateway.
- Add order management dashboard.
- Add customer order history.
- Add product review and rating system.
- Add email confirmation for orders.
- Add analytics for most viewed and best-selling products.
- Add backend server for stronger security and advanced business logic.

---

## 🙌 Thank You

Thank you for supporting **CoyToy BD**.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
