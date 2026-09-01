import {
  NavLink,
  Outlet,
  Link,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
  PlusCircle,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

function AdminLayout() {
  const linkClass = ({
    isActive,
  }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-black"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const linkStyle = ({
    isActive,
  }) => ({
    color: isActive
      ? "#ffffff"
      : undefined,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r z-40 flex flex-col">
        {/* Logo */}

        <div className="h-20 shrink-0 flex items-center px-6 border-b">
          <Link
            to="/admin"
            className="text-xl font-bold tracking-wide"
          >
            NEXORA ADMIN
          </Link>
        </div>

        {/* Navigation */}

        <div className="flex-1 flex flex-col min-h-0 p-4">
          <nav className="space-y-2">
            <NavLink
              to="/admin"
              end
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <LayoutDashboard
                size={20}
              />

              <span>
                Dashboard
              </span>
            </NavLink>

            <NavLink
              to="/admin/products"
              end
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <Package
                size={20}
              />

              <span>
                Products
              </span>
            </NavLink>

            <NavLink
              to="/admin/products/add"
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <PlusCircle
                size={20}
              />

              <span>
                Add Product
              </span>
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <ShoppingBag
                size={20}
              />

              <span>
                Orders
              </span>
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <Tags
                size={20}
              />

              <span>
                Categories
              </span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <Users
                size={20}
              />

              <span>
                Users
              </span>
            </NavLink>

            <NavLink
              to="/admin/contact-messages"
              className={
                linkClass
              }
              style={
                linkStyle
              }
            >
              <MessageSquare
                size={20}
              />

              <span>
                Contact Messages
              </span>
            </NavLink>
          </nav>

          {/* Bottom Area */}

          <div className="mt-auto pt-5">
            <div className="border-t pt-5">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                <ArrowLeft
                  size={20}
                />

                <span>
                  Back to Store
                </span>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;