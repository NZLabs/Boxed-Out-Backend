const debug_print = (message) => {
  if (process.env.NODE_ENV === "development") console.log(message);
};

const debug_print_error = (message) => {
  if (process.env.NODE_ENV === "development") console.error(message);
};
