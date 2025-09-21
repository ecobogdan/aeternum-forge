import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from '@/components/Seo';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const canonicalPath = location.pathname;

  return (
    <>
      <Seo
        title="404 | Page Not Found | NW-Builds"
        description="The page you requested could not be found on NW-Builds."
        canonical={canonicalPath}
        noIndex
      />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
          <a href="/" className="text-blue-500 underline hover:text-blue-700">
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
