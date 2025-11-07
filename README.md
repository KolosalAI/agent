# Kolosal Agent API

<div align="center">

[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**AI-powered HTTP API for intelligent code assistance**

[Quick Start](#quick-start) • [API Documentation](#api-documentation) • [Features](#features) • [Contributing](./CONTRIBUTING.md)

</div>

Kolosal Agent API is a powerful HTTP API service that provides AI-powered code assistance, analysis, and development workflow automation. Built for seamless integration with IDEs, editors, and development tools, it offers advanced code understanding capabilities powered by state-of-the-art language models.

## Features

- **HTTP API Service** - RESTful API for AI-powered code assistance and analysis
- **Code Understanding** - Deep analysis and comprehension of complex codebases
- **Streaming Support** - Real-time Server-Sent Events for responsive user experiences
- **Multi-Model Support** - Compatible with OpenAI, custom models, and various AI providers
- **Tool Integration** - Built-in code analysis, file operations, and development tools
- **Conversation History** - Multi-turn conversations with context preservation
- **Flexible Configuration** - Environment variables and JSON configuration support

## Installation

### Prerequisites

- [Node.js version 20](https://nodejs.org/en/download) or higher
- npm or yarn package manager

### Build from Source

```bash
git clone https://github.com/KolosalAI/agent.git
cd agent
npm install
npm run build
```

### Start the API Server

```bash
npm run start
```

The API server will start on `http://localhost:8080` by default.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup instructions.

## Quick Start

### 1. Start the API Server

```bash
npm run start
```

### 2. Make Your First API Call

```bash
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello! Can you help me understand this codebase?",
    "stream": false
  }'
```

### 3. Example API Calls

```bash
# Code analysis
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Explain the structure of this project", "stream": false}'

# Generate tests
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Generate unit tests for the authentication module", "stream": false}'

# Code review
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Review this code for security issues and best practices", "stream": false}'
```

### Configuration

#### Environment Variables

Configure the API server and AI models using environment variables:

```bash
# API Server Configuration
export PORT=8080                              # Server port (default: 8080)
export HOST=localhost                         # Server host (default: localhost)

# AI Model Configuration
export OPENAI_API_KEY="your_api_key_here"     # OpenAI or compatible API key
export OPENAI_BASE_URL="your_api_endpoint"    # API endpoint URL
export OPENAI_MODEL="your_model_choice"       # Model name (e.g., gpt-4, gpt-3.5-turbo)

# Alternative: Custom API Provider
export API_KEY="your_custom_api_key"          # Custom API key
export BASE_URL="http://localhost:8081/v1"    # Custom API base URL
export MODEL="your_model_name"                # Custom model name
```

#### Configuration File

Alternatively, create a configuration file at `config/settings.json`:

```json
{
  "server": {
    "port": 8080,
    "host": "localhost",
    "corsEnabled": true
  },
  "ai": {
    "apiKey": "your_api_key",
    "baseUrl": "your_api_endpoint",
    "model": "your_model_name"
  }
}
```

> **Note**: The API may issue multiple calls to the underlying AI model per request for complex tasks, which can result in higher token usage.

## Usage Examples

### Code Analysis & Understanding

```bash
# Analyze project structure
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Explain this codebase architecture and main components"}'

# Dependency analysis
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "What are the key dependencies and how do they interact?"}'

# Security review
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Find all API endpoints and check for security vulnerabilities"}'
```

### Code Development & Refactoring

```bash
# Code refactoring
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Suggest improvements for this function to enhance readability and performance"}'

# Test generation
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Generate comprehensive unit tests for the authentication module"}'

# Code review
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Review this code and suggest best practices improvements"}'
```

### Streaming Responses

```bash
# Real-time streaming response
curl -N -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Explain the API architecture", "stream": true}'
```

## Development & Contributing

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/KolosalAI/agent.git
cd agent
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Start the development server:

```bash
npm run start
```

5. Run tests:

```bash
npm test
```

### Project Structure

```
packages/
├── api-server/          # HTTP API server implementation
├── core/               # Core AI and tool functionality
└── test-utils/         # Shared testing utilities

scripts/                # Build and deployment scripts
docs/                   # Documentation
```

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to contribute to the project.

### Building for Production

```bash
npm run build           # Build all packages
npm run test            # Run test suite
```

## Acknowledgments

Kolosal Agent API is built upon and incorporates concepts from several open-source projects. We acknowledge and appreciate the excellent work of all contributors to the AI and developer tooling ecosystem.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text.

## API Documentation

Kolosal CLI includes an embedded HTTP API server that allows programmatic access to AI code assistance features. The API is designed to integrate seamlessly with editors, IDEs, and other development tools.

### Getting Started

The API server runs as a standalone service and listens on `http://localhost:8080` by default.

#### Configuration

Configure the API server using environment variables:

```bash
export PORT=8080                               # Port to listen on (default: 8080)
export HOST=localhost                          # Host binding (default: localhost)
export API_TOKEN=your_secret_token             # Optional authentication token
export CORS_ENABLED=true                       # Enable CORS (default: true)
```

Or configure via `config/settings.json`:

```json
{
  "server": {
    "port": 8080,
    "host": "localhost",
    "token": "your-secret-token",
    "corsEnabled": true
  }
}
```

### API Endpoints

#### Health Check

**GET** `/healthz`

Check if the API server is running and healthy.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Generate Content

**POST** `/v1/generate`

Generate AI-powered responses for code assistance, analysis, and development tasks.

**Request Headers:**

| Header          | Required    | Description                     | Example                      |
| --------------- | ----------- | ------------------------------- | ---------------------------- |
| `Content-Type`  | Yes         | Request body format             | `application/json`           |
| `Authorization` | Conditional | Bearer token for authentication | `Bearer your-secret-token`   |
| `Accept`        | No          | Preferred response format       | `application/json` (default) |
| `User-Agent`    | No          | Client identification           | `MyApp/1.0.0`                |

**Response Headers:**

| Header                        | Description              | Example                                   |
| ----------------------------- | ------------------------ | ----------------------------------------- |
| `Content-Type`                | Response body format     | `application/json` or `text/event-stream` |
| `Access-Control-Allow-Origin` | CORS origin (if enabled) | `*` or specific domain                    |
| `Cache-Control`               | Caching policy           | `no-cache`                                |
| `X-Request-ID`                | Request tracking ID      | `req-abc123-def456`                       |

**Request Body:**

| Field               | Type    | Required | Description                                       |
| ------------------- | ------- | -------- | ------------------------------------------------- |
| `input`             | string  | Yes      | The prompt or question to send to the AI          |
| `stream`            | boolean | No       | Enable streaming response (default: false)        |
| `prompt_id`         | string  | No       | Unique identifier for the request                 |
| `history`           | array   | No       | Conversation history for multi-turn conversations |
| `model`             | string  | No       | Override the default model                        |
| `api_key`           | string  | No       | Override the default API key                      |
| `base_url`          | string  | No       | Override the default API base URL                 |
| `working_directory` | string  | No       | Set the working directory for file operations     |

#### Detailed Request Model

```typescript
interface GenerateRequest {
  // Required fields
  input: string; // The prompt or question to send to the AI

  // Optional fields
  stream?: boolean; // Enable streaming response (default: false)
  prompt_id?: string; // Unique identifier for the request
  history?: ConversationMessage[]; // Previous conversation context
  model?: string; // AI model to use (e.g., "gpt-4", "z-ai/glm-4.6")
  api_key?: string; // API key for the AI service
  base_url?: string; // Base URL for the AI service API
  working_directory?: string; // Working directory for file operations
}

interface ConversationMessage {
  type: 'user' | 'assistant' | 'tool_call' | 'tool_result';
  content?: string; // Message content (for user/assistant)
  name?: string; // Tool name (for tool_call/tool_result)
  arguments?: Record<string, any>; // Tool arguments (for tool_call)
  ok?: boolean; // Tool execution status (for tool_result)
  responseText?: string; // Tool response (for tool_result)
}
```

**Example Request:**

```json
{
  "input": "Explain this codebase structure and suggest improvements",
  "stream": false,
  "prompt_id": "req-123",
  "working_directory": "/path/to/project",
  "model": "z-ai/glm-4.6",
  "history": [
    {
      "type": "user",
      "content": "What files are in this project?"
    },
    {
      "type": "assistant",
      "content": "I can see several TypeScript files including API handlers..."
    }
  ]
}
```

### Response Formats

#### Detailed Response Models

```typescript
// Token usage information
interface TokenUsage {
  prompt_tokens: number; // Tokens used in the input/prompt
  completion_tokens: number; // Tokens generated in the response
  total_tokens: number; // Total tokens used (input + output)
  cached_tokens?: number; // Cached tokens (if supported by model)
  thinking_tokens?: number; // Tokens used for reasoning (if supported)
  tool_tokens?: number; // Tokens used for tool calls (if applicable)
}

// Non-streaming success response
interface GenerateResponse {
  output: string; // Final AI-generated response text
  prompt_id: string; // Request identifier (echoed back)
  messages: TranscriptMessage[]; // Transcript of this conversation turn
  history: ConversationMessage[]; // Updated conversation history
  usage?: TokenUsage; // Token usage statistics
}

// Error response
interface ErrorResponse {
  error: string; // Error message describing what went wrong
}

// Transcript message (part of response)
interface TranscriptMessage {
  type: 'user' | 'assistant' | 'tool_call' | 'tool_result';
  content?: string; // Message content
  name?: string; // Tool name (for tool operations)
  arguments?: Record<string, any>; // Tool arguments (for tool_call)
  ok?: boolean; // Success status (for tool_result)
  responseText?: string; // Tool output (for tool_result)
  timestamp?: string; // When the message occurred
}

// Streaming event data
interface StreamEvent {
  event:
    | 'content'
    | 'assistant'
    | 'tool_call'
    | 'tool_result'
    | 'history'
    | 'usage'
    | 'done'
    | 'error';
  data: string; // Event payload (JSON string for structured events)
}
```

#### Non-Streaming Response

**Success Response (200):**

```json
{
  "output": "Based on the codebase structure, this appears to be a Node.js API project with TypeScript. The main components include...",
  "prompt_id": "req-123",
  "messages": [
    {
      "type": "user",
      "content": "Explain this codebase structure and suggest improvements",
      "timestamp": "2025-11-07T10:30:00Z"
    },
    {
      "type": "tool_call",
      "name": "file_search",
      "arguments": { "query": "**/*.{js,ts,json}" }
    },
    {
      "type": "tool_result",
      "name": "file_search",
      "ok": true,
      "responseText": "Found 25 TypeScript files, 3 JSON config files..."
    },
    {
      "type": "assistant",
      "content": "Based on the codebase structure, this appears to be a Node.js API project...",
      "timestamp": "2025-11-07T10:30:15Z"
    }
  ],
  "history": [
    {
      "type": "user",
      "content": "Explain this codebase structure and suggest improvements"
    },
    {
      "type": "assistant",
      "content": "Based on the codebase structure, this appears to be a Node.js API project..."
    }
  ],
  "usage": {
    "prompt_tokens": 1250,
    "completion_tokens": 892,
    "total_tokens": 2142,
    "cached_tokens": 450,
    "tool_tokens": 75
  }
}
```

**Error Response (400/500):**

```json
{
  "error": "Missing required field: input"
}
```

**Validation Error Response (400):**

```json
{
  "error": "Invalid model specified. Supported models: gpt-4, gpt-3.5-turbo, z-ai/glm-4.6"
}
```

#### Streaming Response (SSE)

When `stream: true`, the API returns Server-Sent Events with real-time updates:

**Event Types:**

| Event         | Description                   | Data Format     | Example                                                                                 |
| ------------- | ----------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| `content`     | Incremental text chunks       | Raw text string | `"Based on the"`                                                                        |
| `assistant`   | Complete assistant message    | JSON object     | `{"type":"assistant","content":"Complete response text"}`                               |
| `tool_call`   | AI tool execution started     | JSON object     | `{"type":"tool_call","name":"file_search","arguments":{"query":"*.ts"}}`                |
| `tool_result` | Tool execution completed      | JSON object     | `{"type":"tool_result","name":"file_search","ok":true,"responseText":"Found 10 files"}` |
| `history`     | Updated conversation history  | JSON array      | `[{"type":"user","content":"..."},{"type":"assistant","content":"..."}]`                |
| `usage`       | Token usage statistics        | JSON object     | `{"prompt_tokens":1250,"completion_tokens":892,"total_tokens":2142}`                    |
| `done`        | Stream completed successfully | String literal  | `"true"`                                                                                |
| `error`       | Error occurred                | JSON object     | `{"message":"Model API rate limit exceeded"}`                                           |

**Example Streaming Response:**

```
event: content
data: Based on the codebase structure

event: content
data: , this appears to be a Node.js

event: tool_call
data: {"type":"tool_call","name":"list_dir","arguments":{"path":"/Users/project"}}

event: tool_result
data: {"type":"tool_result","name":"list_dir","ok":true,"responseText":"packages/\nscripts/\npackage.json"}

event: content
data: API project with the following structure:

event: assistant
data: {"type":"assistant","content":"Based on the codebase structure, this appears to be a Node.js API project with the following structure: ..."}

event: history
data: [{"type":"user","content":"Explain this codebase"},{"type":"assistant","content":"Based on the codebase structure..."}]

event: usage
data: {"prompt_tokens":1250,"completion_tokens":892,"total_tokens":2142,"cached_tokens":450,"tool_tokens":75}

event: done
data: true
```

### Usage Examples

#### Basic Code Analysis

```bash
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Explain the main components of this project",
    "stream": false
  }' | jq
```

#### Streaming Response

```bash
curl -N -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Generate unit tests for the authentication module",
    "stream": true
  }'
```

#### Multi-turn Conversation

```bash
# First turn
RESPONSE=$(curl -s -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"input":"What design patterns are used in this codebase?","stream":false}')

# Extract history for context
HISTORY=$(echo $RESPONSE | jq -c '.history')

# Second turn with context
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d "{\"input\":\"How can I refactor the singleton pattern?\",\"stream\":false,\"history\":$HISTORY}" | jq
```

#### Using Custom Model and API Key

```bash
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Review this code for security issues",
    "stream": false,
    "model": "z-ai/glm-4.6",
    "api_key": "your-api-key",
    "base_url": "http://localhost:8081/v1"
  }' | jq
```

#### With Authentication

```bash
curl -X POST http://localhost:8080/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "input": "Generate documentation for this API",
    "stream": false
  }' | jq
```

### Integration Examples

#### JavaScript/Node.js

```javascript
class KolosalAPI {
  constructor(baseUrl = 'http://localhost:8080', token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async generate(input, options = {}) {
    const response = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        input,
        stream: false,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async *generateStream(input, options = {}) {
    const response = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        input,
        stream: true,
        ...options,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: ') {
          yield JSON.parse(line.slice(6));
        }
      }
    }
  }
}

// Usage
const api = new KolosalAPI();
const result = await api.generate('Explain this function');
console.log(result.output);
```

#### Python

```python
import requests
import json
from typing import Optional, Dict, Any, Iterator

class KolosalAPI:
    def __init__(self, base_url: str = "http://localhost:8080", token: Optional[str] = None):
        self.base_url = base_url
        self.token = token

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def generate(self, input_text: str, **kwargs) -> Dict[str, Any]:
        """Generate a non-streaming response"""
        payload = {"input": input_text, "stream": False, **kwargs}

        response = requests.post(
            f"{self.base_url}/v1/generate",
            headers=self._headers(),
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def generate_stream(self, input_text: str, **kwargs) -> Iterator[Dict[str, Any]]:
        """Generate a streaming response"""
        payload = {"input": input_text, "stream": True, **kwargs}

        response = requests.post(
            f"{self.base_url}/v1/generate",
            headers=self._headers(),
            json=payload,
            stream=True
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if line and line.startswith(b'data: '):
                data = line[6:].decode('utf-8')
                if data.strip():
                    yield json.loads(data)

# Usage
api = KolosalAPI()
result = api.generate("Review this code for best practices")
print(result["output"])

# Streaming example
for event in api.generate_stream("Generate tests for this module"):
    if event.get("type") == "content":
        print(event["data"], end="", flush=True)
```

### Error Handling

The API returns appropriate HTTP status codes with detailed error information:

#### Status Codes

| Code | Status                | Description                          | Example Scenarios                        |
| ---- | --------------------- | ------------------------------------ | ---------------------------------------- |
| 200  | Success               | Request completed successfully       | Valid request with proper response       |
| 400  | Bad Request           | Invalid request format or parameters | Missing `input` field, invalid JSON      |
| 401  | Unauthorized          | Authentication failed                | Invalid or missing API token             |
| 429  | Too Many Requests     | Rate limit exceeded                  | Too many concurrent requests             |
| 500  | Internal Server Error | Server or AI model error             | AI service unavailable, processing error |
| 502  | Bad Gateway           | Upstream AI service error            | AI model API is down                     |
| 503  | Service Unavailable   | Server temporarily unavailable       | Maintenance mode, overloaded             |

#### Error Response Examples

**Missing Required Field (400):**

```json
{
  "error": "Missing required field: input",
  "code": "MISSING_FIELD",
  "details": {
    "field": "input",
    "message": "The 'input' field is required for all requests"
  }
}
```

**Authentication Error (401):**

```json
{
  "error": "Invalid authentication token",
  "code": "INVALID_TOKEN",
  "details": {
    "message": "The provided token is expired or invalid"
  }
}
```

**AI Model Error (500):**

```json
{
  "error": "AI model processing failed",
  "code": "MODEL_ERROR",
  "details": {
    "model": "z-ai/glm-4.6",
    "message": "Model returned an unexpected response format"
  }
}
```

**Rate Limit Error (429):**

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "details": {
    "limit": 100,
    "window": "1 hour",
    "retry_after": 3600
  }
}
```

Always check the response status and handle errors appropriately in your integrations. For streaming responses, errors are sent as SSE events with `event: error`.

### Rate Limiting

Currently, there are no built-in rate limits, but consider implementing client-side throttling for production use to avoid overwhelming the AI model APIs.

### CORS Support

CORS is enabled by default when `corsEnabled` is set to `true` in the configuration, allowing web applications to make direct requests to the API.
