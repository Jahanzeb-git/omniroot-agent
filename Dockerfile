################################################################################
# 1) Base image: Python 3.12-slim, then install Node 18                         #
################################################################################
FROM python:3.12-slim AS build-env

# (Optional) Metadata
LABEL maintainer="jahanzebahmed.mail@gmail.com"

# Install tools needed to add NodeSource, build native modules, and essential commands
RUN apt-get update -qq \
 && apt-get install -y -q \
    curl \
    gnupg \
    build-essential \
    lsof \
    tree \
    coreutils \
    procps \
    net-tools \
    grep \
    bash \
    debianutils \
    findutils \
    git \
    wget \
    sudo \
 && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
 && curl -fsSL https://code-server.dev/install.sh | sh \
 && apt-get install -y nodejs \
 && rm -rf /var/lib/apt/lists/*

# Create a non-root user and directories
RUN useradd -ms /bin/bash omniroot \
 && mkdir -p /app/workspace /data \
 && chown omniroot:omniroot /app/workspace /data

# Set working directory
WORKDIR /app

################################################################################
# 2) Copy only Backend requirements and install Python dependencies             #
################################################################################

# Copy requirements.txt first to leverage Docker layer caching
COPY Backend/requirements.txt /app/Backend/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/Backend/requirements.txt

################################################################################
# 3) Copy the rest of the Backend and the entire Frontend                       #
################################################################################

COPY Backend/ /app/Backend/
COPY Frontend/ /app/Frontend/

################################################################################
# 4) Build the Frontend (Vite/React/Tailwind)                                   #
################################################################################

WORKDIR /app/Frontend

# Install NPM dependencies and build production assets into Frontend/dist
RUN npm install \
 && npm run build

# Set ownership to non-root user
RUN chown -R omniroot:omniroot /app

################################################################################
# 5) Copy entrypoint script BEFORE switching user and make it executable       #
################################################################################

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

################################################################################
# 6) Switch to non-root user AFTER setting permissions                         #
################################################################################

USER omniroot

################################################################################
# 7) Expose ports for Flask (5001) and Frontend static server (5173)            #
################################################################################

EXPOSE 5001 5173 8080

################################################################################
# 8) Default command runs entrypoint.sh                                        #
################################################################################

CMD ["/entrypoint.sh"]