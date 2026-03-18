const { execSync } = require("node:child_process");

const app = process.argv[2];

const watchedPaths = {
  frontend: ["frontend/"],
  admin: ["admin/"],
};

if (!watchedPaths[app]) {
  console.error(`Unknown app: ${app}`);
  process.exit(1);
}

function getChangedFiles() {
  try {
    return execSync("git diff --name-only HEAD^ HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch {
    // If git history is unavailable (first deploy, squash edge case, etc.),
    // build instead of accidentally skipping a necessary deployment.
    return null;
  }
}

const changedFiles = getChangedFiles();

if (!changedFiles) {
  process.exit(1);
}

const shouldBuild = changedFiles.some((file) =>
  watchedPaths[app].some((prefix) => file.startsWith(prefix)),
);

// Vercel Ignored Build Step contract:
// - exit 0 => skip build
// - exit 1 => continue build
process.exit(shouldBuild ? 1 : 0);
