const isEmpty = (value) => {
  if (value === undefined || value === null || value === "") return true;
  else if (typeof value === "string") {
    value = value.trim();
    if (value === "") return true;
  }
  return false;
};
