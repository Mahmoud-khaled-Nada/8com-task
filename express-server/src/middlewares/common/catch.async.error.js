export const catchAsyncError = (handler) => {
    return (req, res, next) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  };
  