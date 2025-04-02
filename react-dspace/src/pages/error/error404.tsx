import 'bootstrap/dist/css/bootstrap.min.css';
import './error.css';


const Error404 = () => {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="row">
        <div className="col-12 text-center">
          <div className="error-container">
            <div className="d-flex justify-content-center align-items-center">
              <div className="question-mark-container me-4">
                <span className="question-mark">?</span>
                <div className="question-shadow"></div>
              </div>
              <div className="error-text">
                <h1 className="display-1 fw-bold text-dark">404</h1>
                <h2 className="text-secondary">error</h2>
                <h3 className="mt-3 text-muted">Page not found</h3>
              </div>
            </div>
            <div className="mt-4">
              <div className="figure-container">
                <div className="figure"></div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/" className="btn btn-primary px-4 py-2">Return Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;


