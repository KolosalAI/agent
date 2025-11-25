# Kolosal AI API Server - Railway Deployment

This guide covers deploying the Kolosal AI API Server to Railway using the provided Dockerfile.

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose this repository

### 2. Configure Environment Variables

Set the following environment variables in your Railway service:

#### Required API Keys
- `GOOGLE_API_KEY` - Your Google Gemini API key
- `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI models)

#### Optional Configuration
- `KOLOSAL_CLI_API_CORS` - Enable CORS (default: `true`)
- `DEBUG` - Enable debug mode (set to `1` for verbose logging)
- `NODE_ENV` - Node environment (Railway sets this to `production` automatically)

### 3. Railway-Specific Configuration

#### Custom Dockerfile Path (if needed)
If you move the Dockerfile to a different location, set:
```
RAILWAY_DOCKERFILE_PATH=/path/to/your/Dockerfile
```

#### Cache Optimization
The Dockerfile is currently configured without cache mounts for maximum compatibility. If you want to add cache mounts for faster builds, you'll need to use Railway's specific format:

Railway cache mount format requires:
```dockerfile
--mount=type=cache,id=s/<service-id>-<cache-name>,target=<target-path>
```

To add npm caching:
1. Find your Railway service ID in the service settings
2. Update the npm install commands in the Dockerfile:

```dockerfile
# In the builder stage:
RUN --mount=type=cache,id=s/your-service-id-npm,target=/root/.npm \
    npm ci --only=production=false

# In the production stage:
RUN --mount=type=cache,id=s/your-service-id-npm,target=/root/.npm \
    npm ci --only=production && npm cache clean --force
```

Example with service ID `abc123def456`:
```dockerfile
RUN --mount=type=cache,id=s/abc123def456-npm,target=/root/.npm \
    npm ci --only=production=false
```

**Note**: Cache mounts are optional and the Dockerfile will work fine without them. They're primarily useful for reducing build times on subsequent deployments.

### 4. Port Configuration

Railway automatically sets the `PORT` environment variable. The Dockerfile is configured to:
- Use Railway's `PORT` environment variable when available
- Fall back to port 8080 for local development
- Bind to `0.0.0.0` to accept external connections

### 5. Build Process

Railway will automatically:
1. Detect the Dockerfile in the root directory
2. Build the multi-stage Docker image
3. Deploy the production stage
4. Start the service using `npm start`

You'll see this message in the build logs:
```
==========================
Using detected Dockerfile!
==========================
```

## Environment Variables Reference

### Server Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (set by Railway) | `8080` |
| `KOLOSAL_CLI_API_HOST` | Server host | `0.0.0.0` |
| `KOLOSAL_CLI_API_CORS` | Enable CORS | `true` |
| `NODE_ENV` | Node environment | `production` |
| `DEBUG` | Enable debug logging | `false` |

### API Keys
| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key | For Gemini models |
| `OPENAI_API_KEY` | OpenAI API key | For OpenAI models |

### GitHub Repository Cloning (Optional)
The API server can automatically clone a GitHub repository at startup, which will be used as the agent's workspace. This is useful for deploying an agent that works on a specific codebase.

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_REPO_PATH` | Repository path (e.g., `owner/repo`) or full GitHub URL | Not set |
| `GITHUB_ACCESS_TOKEN` | OAuth access token for private repositories | Not set |
| `GITHUB_REPO_BRANCH` | Branch to clone | Default branch |
| `AGENT_WORKSPACE_DIR` | Target directory for the cloned repo | `/app/workspace` |

#### Example: Deploying with a Repository

To have your Railway deployment clone a repository at startup:

1. **For public repositories:**
   ```
   GITHUB_REPO_PATH=your-org/your-repo
   ```

2. **For private repositories:**
   ```
   GITHUB_REPO_PATH=your-org/your-private-repo
   GITHUB_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   ```

3. **To clone a specific branch:**
   ```
   GITHUB_REPO_PATH=your-org/your-repo
   GITHUB_REPO_BRANCH=develop
   ```

The agent will then operate in the context of the cloned repository, allowing it to read, analyze, and modify files within that codebase.

## API Endpoints

Once deployed, your Railway service will expose:

- `GET /healthz` - Health check endpoint
- `GET /status` - Server status information
- `POST /v1/generate` - Main generation endpoint

### Example API Request

```bash
curl -X POST https://your-railway-app.railway.app/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello, how can you help me?",
    "stream": false,
    "model": "z-ai/glm-4.6",
    "api_key": "your-api-key",
    "base_url": "https://api.your-provider.com/v1"
  }'
```

## Monitoring and Logs

### Viewing Logs
In your Railway dashboard:
1. Go to your service
2. Click on the "Logs" tab
3. View real-time logs or filter by date/time

### Health Monitoring
The Dockerfile includes a health check that Railway can use to monitor your service:
- Endpoint: `/healthz`
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3

### Custom Domains
You can add a custom domain in Railway:
1. Go to your service settings
2. Click on "Domains"
3. Add your custom domain
4. Configure DNS as instructed

## Troubleshooting

### Build Issues

1. **Cache mount errors:**
   - Ensure you've updated the service ID in the cache mount paths
   - Check that the syntax is correct: `id=s/<service-id>-<target-path>`

2. **Dependency installation fails:**
   - Check that all package.json files are properly copied
   - Verify that the workspace configuration is correct

3. **TypeScript compilation errors:**
   - Ensure all source files are copied before the build step
   - Check that TypeScript configurations are valid

### Runtime Issues

1. **Service not starting:**
   - Check the logs for startup errors
   - Verify that all required environment variables are set
   - Ensure the PORT environment variable is being used correctly

2. **API requests failing:**
   - Verify that CORS is enabled if making browser requests
   - Check that API keys are correctly set
   - Ensure the service is binding to `0.0.0.0` not `localhost`

3. **Health check failures:**
   - Check that the `/healthz` endpoint is accessible
   - Verify the health check configuration in the Dockerfile
   - Look for any errors in the service startup

### Performance Optimization

1. **Build time:**
   - Use cache mounts with your service ID
   - Consider using `.dockerignore` to exclude unnecessary files
   - Review dependency installation for optimization opportunities

2. **Runtime performance:**
   - Monitor memory and CPU usage in Railway dashboard
   - Consider scaling options if needed
   - Review logs for performance bottlenecks

## Local Development

To test locally before deploying:

```bash
# Build the Docker image
docker build -t kolosal-api .

# Run with environment variables
docker run -p 8080:8080 \
  -e GOOGLE_API_KEY="your-key" \
  -e DEBUG=1 \
  kolosal-api

# Test the health endpoint
curl http://localhost:8080/healthz
```

## Support

For Railway-specific issues:
- [Railway Documentation](https://docs.railway.app/)
- [Railway Community](https://help.railway.app/)

For application-specific issues:
- Check the application logs in Railway dashboard
- Review the Dockerfile configuration
- Verify environment variable settings