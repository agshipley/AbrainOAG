FROM oven/bun:1.3

# git: needed at runtime so gbrain sync can find the repo history.
# Railway strips .git from the Docker build context (security isolation),
# so we clone fresh at container start instead of relying on COPY.
RUN apt-get update && apt-get install -y git --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install gbrain from Garry Tan's public GitHub repo
# Pin to the version currently running in production: 0.42.53.0
# Update this line when intentionally upgrading gbrain
RUN bun install -g github:garrytan/gbrain

WORKDIR /app

# Clone vault fresh on each run — always latest HEAD, real .git history intact.
# Vault is public so no credentials needed.
# Hardening: pin to a specific commit SHA for production stability.
CMD ["sh", "-c", "git clone --depth 1 https://github.com/agshipley/AbrainOAG . && gbrain dream --repo /app"]
