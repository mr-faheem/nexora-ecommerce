import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-7xl font-bold text-black">
        404
      </h1>

      <p className="mt-4 text-xl text-gray-600">
        Page not found
      </p>

      <Link
        to="/"
        className="mt-6 bg-black text-white px-6 py-3 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;