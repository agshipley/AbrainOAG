FROM oven/bun:1.3

# Install gbrain from Garry Tan's public GitHub repo
# Pin to the version currently running in production: 0.42.53.0
# Update this line when intentionally upgrading gbrain
RUN bun install -g github:garrytan/gbrain

# Vault content is mounted/cloned at /app by Railway
WORKDIR /app

# Default: nightly dream cycle. Override start command in Railway for other services.
CMD ["gbrain", "dream", "--repo", "/app"]
