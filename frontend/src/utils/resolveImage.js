export function resolveImage(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000/images/${path}`;
}
