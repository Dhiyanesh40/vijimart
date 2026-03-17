import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Only log routes that look like they should exist (not external trackers)
    if (!location.pathname.includes('hybridaction') && !location.pathname.includes('tracker')) {
      console.warn("404: Route not found:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
