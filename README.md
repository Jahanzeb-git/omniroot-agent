# 🤖 Omniroot Agent

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/jahanzeb833/omniroot-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-v1.3.0-blue?style=for-the-badge)](https://github.com/Jahanzeb-git/omniroot-agent)

> **🛡️ SECURE CONTAINERIZED ENVIRONMENT**: This agent operates within a secure Docker container with isolated access to its own environment. Safe for development and testing without compromising host system security.

## 🎯 Overview

**Omniroot Agent** is a sophisticated, containerized Agentic AI application built with LangChain and LiteLLM that provides autonomous task execution with multi-LLM support. Designed for secure development environments, this agent combines the power of multiple AI models with containerized access to solve complex coding tasks, development workflows, and automation challenges.

## 🖼️ Application Preview

[![Screenshot-from-2025-06-06-17-41-21.png](https://i.postimg.cc/fWPzRCKD/Screenshot-from-2025-06-06-17-41-21.png)](https://postimg.cc/SjWFZW3v)

*Omniroot Agent's integrated development environment featuring VS Code Web IDE, terminal interface, multi-LLM chat, and real-time system monitoring capabilities.*

## ✨ Key Features

### 🧠 **Multi-LLM Intelligence Hub**
- **OpenAI Models**: GPT-4, GPT-o1, GPT-o1-mini, GPT-o3
- **Anthropic Claude**: Claude 3.5 Sonnet, Claude 3.7 Sonnet, Claude 4 Opus, Claude 4 Sonnet
- **Google Gemini**: Gemini 2.5 Pro, Gemini 1.5 Pro
- **Open Source**: Together AI's Qwen 2.5 Coder Instruct 32B, Qwen 3, Deepseek V3
- **Extensible**: Easy integration of additional models via LiteLLM

### 🔐 **Containerized Development Environment**
- Secure isolated container environment
- Full filesystem operations within container scope
- Shell command execution with container-level access
- Project creation and development server management
- File editing and code manipulation capabilities
- No host system access - maintains security boundaries

### 💾 **Advanced Memory Management**
- **Contextual Memory Condensation**: Custom algorithm using LangChain's ConversationSummaryMemory
- **Dynamic Context Optimization**: Maximizes context retention while minimizing token usage
- **Session Persistence**: Resume conversations and workflows across container restarts
- **Workflow State Management**: Maintains task context and execution state

### 🖥️ **Integrated Development Environment**
- **VS Code Web Interface**: Full-featured code editor accessible via browser (Port 8080)
- **Live Terminal Access**: Real-time command execution with streaming output
- **Development Servers**: Instant preview and testing of web applications
- **Frontend Preview**: Live preview tabs for development projects

### 🔄 **Real-Time Communication**
- **Server-Sent Events (SSE)**: Streaming responses and real-time updates
- **WebSocket Integration**: Bidirectional communication for terminal and file operations
- **REST API**: Comprehensive HTTP endpoints for all agent functionalities
- **Event-Driven Architecture**: Asynchronous task execution and status updates

### 🛠️ **Custom Tool Ecosystem**
- **Shell Tool**: Container-level command execution with safety validations
- **File Tools**: Advanced read/write operations within container environment
- **Email Tool**: SMTP integration for notifications and reporting
- **Development Tools**: Project scaffolding, server management, and code analysis
- **Extensible Framework**: Easy integration of custom tools and capabilities

### 🚨 **Intelligent Safety Systems**
- **Dynamic Prompting**: Adaptive prompt engineering based on execution context
- **Command Validation**: Pre-execution safety checks and confirmations
- **Container Isolation**: Secure boundaries preventing host system access
- **Risk Assessment**: Automated evaluation of command impact within container scope

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Omniroot Agent Container (v1.3.0)                   │
├─────────────────────┬───────────────────────────────────────────────────────┤
│    Frontend Layer   │                 Backend Layer                         │
│   (React/TypeScript)│               (Python/FastAPI)                        │
│     Port: 5173      │                Port: 5001                             │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ • VS Code Web IDE   │ • LangChain Agent Engine                              │
│   (Port: 8080)      │ • Multi-LLM Router (LiteLLM)                          │
│ • Terminal Interface│ • Memory Condensation Layer                           │
│ • Real-time Chat UI │ • SSE Streaming Server                                │
│ • Session Management│ • WebSocket Event Handler                             │
│ • Settings Panel    │ • REST API Endpoints                                  │
│ • Preview Tabs      │ • Development Server Manager                          │
└─────────────────────┴───────────────────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────────┐
        │                               │                                   │
   ┌────▼────┐                    ┌────▼────┐                        ┌─────▼─────┐
   │   LLM   │                    │  Tools  │                        │  Memory   │
   │ Router  │                    │ Engine  │                        │ Manager   │
   └─────────┘                    └─────────┘                        └───────────┘
        │                              │                                   │
 ┌──────┼──────┐            ┌─────────┼─────────┐                    ┌─────┼─────┐
 │      │      │            │         │         │                    │     │     │
▼      ▼      ▼            ▼         ▼         ▼                    ▼     ▼     ▼
OpenAI  Claude  Gemini    Shell    File     Email              Context Summary Session
GPT-4   Models  Pro      Tool     Tools    Tool               Memory  Engine  Store
Together.AI     │         │        │        │                   │       │       │
Deepseek V3     │         │        │        │                   │       │       │
                │         │        │        │                   │       │       │
                ▼         ▼        ▼        ▼                   ▼       ▼       ▼
           ┌─────────────────────────────────────────────────────────────────────┐
           │                Container Environment Access                         │
           │  • Container FS: /app/workspace  • File Operations                  │
           │  • Shell Commands              • Development Servers               │
           │  • Process Control             • Project Management                │
           │  • Secure Boundaries           • Code Execution                    │
           └─────────────────────────────────────────────────────────────────────┘
```

### Communication Flow
1. **Frontend** sends requests via REST API or WebSocket
2. **Backend** processes through LangChain agent with selected LLM
3. **Tools Engine** executes operations within container environment
4. **Memory Manager** condenses and stores conversation context
5. **SSE Stream** delivers real-time updates to frontend
6. **Container Environment** provides isolated access to development resources

## 📁 Project Structure

```
Omniroot-agent/
├── Backend/
│   ├── agent.py                 # Core LangChain agent logic
│   ├── app.py                   # FastAPI application & SSE endpoints
│   ├── prompts/
│   │   ├── agent_prompt.py      # Dynamic agent system prompts
│   │   └── summary_prompt.py    # Memory condensation prompts
│   ├── tools/
│   │   ├── shell_tool.py        # Container command execution
│   │   ├── file_tools.py        # File system read/write operations
│   │   ├── email_tool.py        # SMTP email integration
│   │   ├── terminal_events.py   # Terminal WebSocket handling
│   │   └── user_shell.py        # Interactive shell interface
│   ├── utils/
│   │   ├── llm_utils.py         # LLM provider management
│   │   ├── memory_utils.py      # Context optimization algorithms
│   │   ├── db_utils.py          # Session and data persistence
│   │   ├── system_utils.py      # Container integration utilities
│   │   ├── service_utils.py     # Development service management
│   │   ├── extract_utils.py     # Data extraction and parsing
│   │   └── codeserver.py        # VS Code server integration
│   ├── watchers/
│   │   └── file_watcher.py      # Real-time file system monitoring
│   └── thread_storage.py        # Thread-safe storage management
├── Frontend/
│   ├── src/
│   │   ├── components/          # React UI components
│   │   ├── contexts/            # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API communication services
│   │   ├── store/               # State management
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Frontend utility functions
│   └── [build configuration]
├── Dockerfile                   # Multi-stage container build
├── docker-compose.yml          # Complete service orchestration
└── entrypoint.sh               # Container initialization script
```

## 🚀 Quick Start

### Prerequisites

- **Docker**: Version 20.0+ with BuildKit support
- **Available Ports**: 5001 (Backend API), 5173 (Frontend UI), 8080 (VS Code)
- **API Keys**: For your chosen LLM providers
- **System Requirements**: Minimum 4GB RAM, 2GB available disk space

### One-Command Installation

```bash
# Pull and run the latest version
docker run -d --name omniroot-agent -p 5173:5173 -p 5001:5001 -p 8080:8080 jahanzeb833/omniroot-agent:latest
# Stop the container
docker stop omniroot-agent
# Start the container again
docker start omniroot-agent
```

### Alternative: Docker Compose (Recommended)

```bash
# Create project directory
mkdir omniroot-agent && cd omniroot-agent

# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/Jahanzeb-git/omniroot-agent/main/docker-compose.yml

# Start the application
docker-compose up -d
```

### Development Setup

```bash
# Clone the repository
git clone git@github.com:Jahanzeb-git/omniroot-agent.git
cd omniroot-agent

# Build and run locally
docker-compose up --build
```

### Access the Application

```
🌐 Frontend Interface: http://localhost:5173
🔗 Backend API: http://localhost:5001
💻 VS Code IDE: http://localhost:8080
```

## ⚙️ Configuration

### Initial Setup

1. **Open the Application** at `http://localhost:5173`

2. **Navigate to Settings** (⚙️ icon in the sidebar)

3. **Configure LLM Provider**:
   ```
   Model Selection: Choose from dropdown (GPT-4, Claude, Gemini, etc.)
   API Key: Enter your provider's API key
   Temperature: 0.1 (recommended for consistent agent behavior)
   Max Tokens: 4000 (adjust based on your needs)
   Max Iterations: 10 (prevents infinite loops)
   ```

4. **Memory Management**:
   ```
   Summarization Percentage: 70% (balance context vs. cost)
   Max Context Length: 16000 tokens
   Session Persistence: Enabled
   ```

5. **Email Integration** (Optional):
   ```
   SMTP Server: smtp.gmail.com
   Port: 587
   Email: your-email@gmail.com
   App Password: your-app-specific-password
   Display Name: Omniroot Agent
   ```

6. **Save Configuration** and refresh the page

## 💡 Usage Examples

### Development Workflow
```
User: "Create a new React TypeScript project with Tailwind CSS and start development server"

Agent: I'll set up a complete React TypeScript project with Tailwind CSS.

📁 Creating project structure in /app/workspace...
📦 Installing dependencies...
🎨 Configuring Tailwind CSS...
🚀 Starting development server on port 3000
✅ Project ready! Access it via the Preview tab or VS Code IDE
```

### File Management & Coding
```
User: "Create a Python FastAPI application with user authentication"

Agent: I'll create a FastAPI application with authentication features.

📝 Creating project structure...
🔐 Setting up JWT authentication...
📊 Adding user management endpoints...
🧪 Creating test files...
⚙️ Configuring environment variables...
✅ FastAPI application ready! Run with: uvicorn main:app --reload
```

### Multi-Step Automation
```
User: "Analyze this CSV file and create a dashboard with charts"

Agent: I'll analyze your CSV data and create an interactive dashboard.

📊 Reading and analyzing CSV data...
📈 Generating statistical insights...
🎨 Creating React dashboard with charts...
📱 Setting up responsive design...
🚀 Starting dashboard server...
✅ Dashboard ready at http://localhost:3001
```

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Container Startup Time** | 15-30 seconds | Initial container initialization |
| **LLM Response Time** | 1-10 seconds | Varies by model complexity and API latency |
| **Memory Usage** | 1-4 GB | Depends on active projects and context size |
| **Container Size** | ~2 GB | Includes all dependencies and tools |
| **Concurrent Operations** | 5-10 | Per container instance |
| **Context Retention** | 85-95% | With memory condensation enabled |
| **File Operations** | <500ms | For standard read/write operations |
| **Development Server Start** | 2-10 seconds | Varies by project type and size |

### Performance Notes
- **Response times vary significantly based on chosen LLM model**
- **GPT-4 and Claude models typically provide faster responses than GPT-o1 series**
- **Open-source models via Together AI may have higher latency**
- **Memory condensation helps maintain performance in long conversations**

## 🛡️ Security & Safety

### Container Security Model
- **Isolated Environment**: All operations occur within the secure Docker container
- **No Host Access**: Container cannot access or modify host system files
- **Network Isolation**: Limited network access based on container configuration
- **Process Isolation**: Container processes are isolated from host processes
- **Resource Limits**: Configurable CPU and memory limits prevent resource exhaustion

### Safe for Development
- **File Operations**: Limited to container workspace directory
- **Command Execution**: Restricted to container environment
- **Network Operations**: Outbound API calls only (for LLM providers)
- **No Privilege Escalation**: Standard user permissions within container

## 🔧 Advanced Usage

### Custom Tool Development

```python
# Example: Custom tool for database operations
from langchain.tools import BaseTool
from typing import Optional

class CustomDatabaseTool(BaseTool):
    name = "database_query"
    description = "Execute database queries within container"
    
    def _run(self, query: str) -> str:
        # Your custom tool implementation
        return result
```

### Memory Configuration

```python
# Adjust memory condensation behavior
MEMORY_CONFIG = {
    "summarization_percentage": 0.7,  # Keep 70% of context
    "max_context_length": 16000,      # Maximum tokens
    "condensation_trigger": 0.8,      # Trigger at 80% capacity
    "preserve_recent_messages": 5     # Always keep last 5 messages
}
```

## 🔍 Troubleshooting

### Common Issues

#### Container Fails to Start
```bash
# Check if ports are available
netstat -tulpn | grep -E ':(5173|5001|8080)'

# Check container logs
docker logs omniroot-agent

# Ensure sufficient resources
docker system df
```

#### LLM Provider Issues
- **Verify API key format and validity**
- **Check rate limits and billing status**
- **Ensure model availability in your region**
- **Test with different models if one fails**

#### Performance Issues
```bash
# Monitor container resources
docker stats omniroot-agent

# Restart container if needed
docker restart omniroot-agent
```

### Debug Mode

Enable detailed logging:

```bash
docker run -e LOG_LEVEL=DEBUG jahanzeb833/omniroot-agent:latest
```

## 🛠️ Development & Contribution

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone git@github.com:Jahanzeb-git/omniroot-agent.git
   cd omniroot-agent
   ```

2. **Backend Development**
   ```bash
   cd Backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend Development**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Build and Test**
   ```bash
   docker build -t omniroot-agent:dev .
   docker run -d -p 5173:5173 -p 5001:5001 -p 8080:8080 omniroot-agent:dev
   ```

### Contributing Guidelines

We welcome contributions! Priority areas include:

- **Enhanced LLM integrations and optimizations**
- **Additional development tools and frameworks**
- **Performance improvements and caching**
- **UI/UX enhancements**
- **Documentation and tutorials**
- **Bug fixes and stability improvements**

### Development Workflow

1. **Fork** the repository on GitHub
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Develop** your changes with tests
4. **Test** thoroughly in container environment
5. **Document** your changes
6. **Commit** with descriptive messages
7. **Push** to your branch
8. **Create** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain** for the powerful agent framework
- **LiteLLM** for seamless multi-provider LLM integration
- **FastAPI** for high-performance API development
- **React & TypeScript** for modern frontend development
- **Docker** for containerization and deployment
- **VS Code** for the integrated development environment
- **Open Source Community** for continuous inspiration and contributions

## 📞 Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Jahanzeb-git/omniroot-agent/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/Jahanzeb-git/omniroot-agent/discussions)
- **📖 Documentation**: [Wiki](https://github.com/Jahanzeb-git/omniroot-agent/wiki)

### Development Status

**Current Version**: v1.3.0 (Beta)

This is a beta release suitable for development and testing. While stable for most use cases, some bugs may exist. Performance depends on chosen LLM model and API response times.

---

<div align="center">

**⭐ Star this repository if you find it useful!**

**🤝 Contributions are welcome and appreciated!**

**🔐 Secure containerized environment for safe development!**

[![GitHub stars](https://img.shields.io/github/stars/Jahanzeb-git/omniroot-agent.svg?style=social&label=Star)](https://github.com/Jahanzeb-git/omniroot-agent)
[![GitHub forks](https://img.shields.io/github/forks/Jahanzeb-git/omniroot-agent.svg?style=social&label=Fork)](https://github.com/Jahanzeb-git/omniroot-agent/fork)
[![Docker Pulls](https://img.shields.io/docker/pulls/jahanzeb833/omniroot-agent.svg)](https://hub.docker.com/r/jahanzeb833/omniroot-agent)

</div>

---

> **💡 Note**: Omniroot Agent v1.3.0 operates within a secure containerized environment, making it safe for development and testing without compromising host system security. This beta release is suitable for coding projects, automation tasks, and AI-assisted development workflows.
