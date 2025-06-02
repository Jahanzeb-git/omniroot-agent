# 🤖 Omniroot Agent

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/jahanzeb833/omniroot-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **⚠️ SECURITY NOTICE**: This agent operates with **ROOT-level system access** and can execute **ANY system commands**. Use only in **isolated environments** and at your **own risk**. Not recommended for production systems.

## 🎯 Overview

**Omniroot Agent** is a sophisticated, containerized Agentic AI application built with LangChain and LiteLLM that provides autonomous system-level task execution with multi-LLM support. Designed specifically for Linux environments, this agent combines the power of multiple AI models with direct OS access to solve complex computational tasks, development workflows, and system administration challenges.

## 🖼️ Application Preview

[![Omniroot Agent Interface](https://i.postimg.cc/s2JNTxqg/Screenshot-from-2025-06-02-19-32-55.png)](https://postimg.cc/Z9CHRbJG)

*Omniroot Agent's integrated development environment featuring VS Code Web IDE, terminal interface, multi-LLM chat, and real-time system monitoring capabilities.*

## ✨ Key Features

### 🧠 **Multi-LLM Intelligence Hub**
- **OpenAI Models**: GPT-4, GPT-o1, GPT-o1-mini, GPT-o3
- **Anthropic Claude**: Claude 3.5 Sonnet, Claude 4 Opus, Claude 4 Sonnet
- **Google Gemini**: Gemini 2.5 Pro, Gemini 1.5 Pro
- **Open Source**: Together AI's Qwen 2.5 Coder Instruct 32B, Qwen 3
- **Extensible**: Easy integration of additional models via LiteLLM

### 🔐 **Root-Level System Access**
- Full filesystem read/write operations
- Direct shell command execution with kernel-level access
- System service management and process control
- Network configuration and monitoring capabilities
- Hardware resource inspection and control

### 💾 **Advanced Memory Management**
- **Contextual Memory Condensation**: Custom algorithm using LangChain's ConversationSummaryMemory
- **Dynamic Context Optimization**: Maximizes context retention while minimizing token usage
- **Session Persistence**: Resume conversations and workflows across container restarts
- **Workflow State Management**: Maintains task context and execution state

### 🖥️ **Integrated Development Environment**
- **VS Code Web Interface**: Full-featured code editor accessible via browser
- **Live Terminal Access**: Real-time command execution with streaming output
- **Development Servers**: Instant preview and testing of web applications
- **File System Browser**: Navigate and manage files with GUI interface

### 🔄 **Real-Time Communication**
- **Server-Sent Events (SSE)**: Streaming responses and real-time updates
- **WebSocket Integration**: Bidirectional communication for terminal and file operations
- **REST API**: Comprehensive HTTP endpoints for all agent functionalities
- **Event-Driven Architecture**: Asynchronous task execution and status updates

### 🛠️ **Custom Tool Ecosystem**
- **Shell Tool**: Direct OS command execution with safety validations
- **File Tools**: Advanced read/write operations with permissions handling
- **Email Tool**: SMTP integration for notifications and reporting
- **System Tools**: Process management, service control, and resource monitoring
- **Extensible Framework**: Easy integration of custom tools and capabilities

### 🚨 **Intelligent Safety Systems**
- **Dynamic Prompting**: Adaptive prompt engineering based on execution context
- **Threat Detection**: Built-in warnings for potentially dangerous operations
- **Command Validation**: Pre-execution safety checks and user confirmations
- **Risk Assessment**: Automated evaluation of command impact and safety

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Omniroot Agent Container                          │
├─────────────────────┬───────────────────────────────────────────────────────┤
│    Frontend Layer   │                 Backend Layer                         │
│   (React/TypeScript)│               (Python/FastAPI)                        │
│     Port: 5173      │                Port: 5001                             │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ • VS Code Web IDE   │ • LangChain Agent Engine                              │
│ • Terminal Interface│ • Multi-LLM Router (LiteLLM)                          │
│ • Real-time Chat UI │ • Memory Condensation Layer                           │
│ • Session Management│ • SSE Streaming Server                                │
│ • File Browser      │ • WebSocket Event Handler                             │
│ • Settings Panel    │ • REST API Endpoints                                  │
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
GPT-4   Sonnet  Pro      Tool     Tools    Tool               Memory  Engine  Store
Together.AI     │         │        │        │                   │       │       │
Qwen Models     │         │        │        │                   │       │       │
                │         │        │        │                   │       │       │
                ▼         ▼        ▼        ▼                   ▼       ▼       ▼
           ┌─────────────────────────────────────────────────────────────────────┐
           │                    Host System Access                               │
           │  • Root FS: /hostroot    • Workspace: /workspace                   │
           │  • Shell Commands        • File Operations                         │
           │  • Process Control       • Network Access                          │
           │  • Kernel Interface      • Service Management                      │
           └─────────────────────────────────────────────────────────────────────┘
```

### Communication Flow
1. **Frontend** sends requests via REST API or WebSocket
2. **Backend** processes through LangChain agent with selected LLM
3. **Tools Engine** executes system operations with safety checks
4. **Memory Manager** condenses and stores conversation context
5. **SSE Stream** delivers real-time updates to frontend
6. **Host System** provides direct access to OS resources

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
│   │   ├── shell_tool.py        # OS command execution with safety
│   │   ├── file_tools.py        # File system read/write operations
│   │   ├── email_tool.py        # SMTP email integration
│   │   ├── terminal_events.py   # Terminal WebSocket handling
│   │   └── user_shell.py        # Interactive shell interface
│   ├── utils/
│   │   ├── llm_utils.py         # LLM provider management
│   │   ├── memory_utils.py      # Context optimization algorithms
│   │   ├── db_utils.py          # Session and data persistence
│   │   ├── system_utils.py      # OS integration utilities
│   │   ├── service_utils.py     # System service management
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
- **Linux Host**: Ubuntu 20.04+ or equivalent (required for privileged access)
- **Available Ports**: 5001 (Backend API) and 5173 (Frontend UI)
- **API Keys**: For your chosen LLM providers
- **Minimum RAM**: 4GB available (8GB+ recommended for larger models)

### One-Command Installation

```bash
# Pull and run with all required privileges and mounts
docker run -d -p 5173:5173 -p 5001:5001 jahanzeb833/omniroot-agent:latest
```

### Alternative: Docker Compose (Recommended)

```bash
# Create a workspace directory
mkdir -p ~/omniroot-workspace
cd ~/omniroot-workspace


### Access the Application

```
🌐 Frontend Interface: http://localhost:5173
🔗 Backend API: http://localhost:5001
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

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `HOME` | Host user home directory | `/hostroot/home/$USER` | Yes |
| `USER` | Current user context | `$USER` | Yes |
| `BACKEND_PORT` | Backend server port | `5001` | No |
| `FRONTEND_PORT` | Frontend server port | `5173` | No |
| `LOG_LEVEL` | Logging verbosity | `INFO` | No |
| `MAX_MEMORY_MB` | Agent memory limit | `2048` | No |

## 💡 Usage Examples

### System Administration
```
User: "Check disk usage and clean up old log files older than 30 days"

Agent: I'll analyze your disk usage and safely clean up old log files.

🔍 Checking disk usage...
📊 Current usage: /dev/sda1 85% full
🧹 Found 2.3GB of log files older than 30 days
✅ Safely removed 127 old log files
💾 Freed up 2.3GB of disk space
```

### Development Workflow
```
User: "Create a new React TypeScript project with Tailwind CSS and start development server"

Agent: I'll set up a complete React TypeScript project with Tailwind CSS.

📁 Creating project structure...
📦 Installing dependencies...
🎨 Configuring Tailwind CSS...
🚀 Starting development server on http://localhost:3000
✅ Project ready for development!
```

### Multi-Step Automation
```
User: "Monitor system performance and send email alerts if CPU usage exceeds 80% for more than 5 minutes"

Agent: I'll create a monitoring system with email notifications.

📊 Setting up performance monitoring...
⚙️ Creating monitoring script...
📧 Configuring email alerts...
⏰ Setting up cron job for continuous monitoring...
✅ Monitoring system active - you'll receive alerts at your configured email
```

## 🔧 Advanced Usage

### Custom Tool Development

```python
# Example: Custom tool for database operations
from langchain.tools import BaseTool
from typing import Optional

class DatabaseTool(BaseTool):
    name = "database_query"
    description = "Execute SQL queries on the database"
    
    def _run(self, query: str) -> str:
        # Your custom tool implementation
        return result
```

### Memory Condensation Tuning

```python
# Adjust memory condensation behavior
MEMORY_CONFIG = {
    "summarization_percentage": 0.7,  # Keep 70% of context
    "max_context_length": 16000,      # Maximum tokens
    "condensation_trigger": 0.8,      # Trigger at 80% capacity
    "preserve_recent_messages": 5     # Always keep last 5 messages
}
```

### Custom Prompt Engineering

```python
# Dynamic prompt modification based on context
SYSTEM_PROMPT_TEMPLATE = """
You are Omniroot Agent with {access_level} system access.
Current context: {context_summary}
Available tools: {tool_list}
Safety mode: {safety_level}

Guidelines:
- Always validate commands before execution
- Provide detailed explanations for complex operations
- Ask for confirmation for potentially destructive actions
"""
```

## 🛡️ Security Considerations

### ⚠️ Critical Security Warnings

This agent operates with **unprecedented system access**:

- **ROOT PRIVILEGES**: Complete administrative control over the host system
- **KERNEL ACCESS**: Direct interaction with system kernel and hardware
- **FILESYSTEM ACCESS**: Read/write access to all files including system files
- **NETWORK CONTROL**: Ability to modify network settings and make external connections
- **PROCESS CONTROL**: Can start, stop, and manage any system process
- **SERVICE MANAGEMENT**: Full control over system services and daemons

### Recommended Security Measures

#### 1. **Isolation Strategies**
```bash
# Run in isolated network
docker network create --driver bridge isolated_net
docker run --network isolated_net jahanzeb833/omniroot-agent:latest

# Limit resource access
docker run --memory=4g --cpus=2 jahanzeb833/omniroot-agent:latest

# Read-only root filesystem (where possible)
docker run --read-only --tmpfs /tmp jahanzeb833/omniroot-agent:latest
```

#### 2. **Volume Restrictions**
```bash
# Limit mounted volumes to specific directories
docker run \
  -v /home/user/safe-workspace:/workspace \
  -v /var/log:/hostroot/var/log:ro \
  jahanzeb833/omniroot-agent:latest
```

#### 3. **Monitoring and Logging**
```bash
# Enable comprehensive logging
docker run \
  --log-driver=json-file \
  --log-opt max-size=100m \
  --log-opt max-file=5 \
  jahanzeb833/omniroot-agent:latest
```

#### 4. **Network Security**
```bash
# Bind to localhost only
docker run -p 127.0.0.1:5173:5173 -p 127.0.0.1:5001:5001 \
  jahanzeb833/omniroot-agent:latest
```

### Production Deployment Considerations

⚠️ **This agent is NOT recommended for production environments** due to its extensive system access requirements. If you must deploy in production:

1. **Use dedicated, isolated virtual machines**
2. **Implement comprehensive audit logging**
3. **Set up real-time security monitoring**
4. **Restrict network access to essential services only**
5. **Regular security assessments and penetration testing**
6. **Backup and disaster recovery procedures**

## 🔍 Troubleshooting

### Common Issues

#### Container Fails to Start
```bash
# Check if ports are available
sudo netstat -tulpn | grep -E ':(5173|5001)'

# Verify Docker daemon is running
sudo systemctl status docker

# Check container logs
docker logs omniroot-agent

# Ensure sufficient resources
docker system df
```

#### Permission Denied Errors
```bash
# Ensure container has privileged access
docker inspect omniroot-agent | grep Privileged

# Check volume mount permissions
ls -la /hostroot/
```

#### API Connection Issues
```bash
# Test backend connectivity
curl -X GET http://localhost:5001/health

# Check frontend build
docker exec omniroot-agent ls -la /app/Frontend/dist/
```

#### LLM Provider Issues
- **Verify API key format and validity**
- **Check rate limits and billing status**
- **Ensure model availability in your region**
- **Test with different temperature settings**

#### Memory and Performance Issues
```bash
# Monitor container resources
docker stats omniroot-agent

# Check memory usage patterns
docker exec omniroot-agent cat /proc/meminfo

# Adjust memory limits
docker update --memory=8g omniroot-agent
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
docker run \
  -e LOG_LEVEL=DEBUG \
  -e PYTHON_ENV=development \
  jahanzeb833/omniroot-agent:latest
```

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Cold Start Time** | 15-30 seconds | Initial container startup |
| **LLM Response Time** | 1-5 seconds | Varies by model and complexity |
| **Memory Usage** | 2-8 GB | Depends on model and context size |
| **Concurrent Sessions** | 5-15 | Per container instance |
| **Context Retention** | 85-95% | With memory condensation enabled |
| **Command Execution** | <1 second | For most shell operations |
| **File Operations** | <500ms | For standard read/write operations |

### Optimization Tips

- **Use GPT-4 for complex reasoning, Claude for coding tasks**
- **Enable memory condensation for long conversations**
- **Adjust temperature to 0.1 for consistent agent behavior**
- **Monitor memory usage and restart container if needed**
- **Use SSD storage for better file operation performance**

## 🛠️ Development & Contribution

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/omniroot-agent.git
   cd omniroot-agent
   ```

2. **Backend Development**
   ```bash
   cd Backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   export FLASK_ENV=development
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
   docker run -d -p 5173:5173 -p 5001:5001 --privileged omniroot-agent:dev
   ```

### Contributing Guidelines

We welcome contributions! Here are the priority areas:

#### 🎯 **High Priority Areas**

**Shell Tool Enhancement**
- Cross-platform command compatibility
- Advanced safety validation mechanisms
- Interactive command prompting and confirmation
- Command history and replay functionality
- Shell session state management

**Memory System Improvements**
- More efficient condensation algorithms
- Custom memory strategies for different use cases
- Long-term memory persistence across sessions
- Context-aware memory prioritization

**Security Hardening**
- Command sandboxing mechanisms
- Role-based access control
- Audit logging and compliance features
- Threat detection and prevention

#### 🔧 **Other Contribution Areas**
- Additional LLM provider integrations (Cohere, AI21, etc.)
- Custom tool development framework
- Performance optimization and caching
- Enhanced error handling and recovery
- Comprehensive test suite expansion
- Documentation improvements and tutorials

### Development Workflow

1. **Fork** the repository on GitHub
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Develop** your changes with tests
4. **Test** thoroughly in isolated environment
5. **Document** your changes and update README if needed
6. **Commit** with descriptive messages (`git commit -m 'Add amazing feature'`)
7. **Push** to your branch (`git push origin feature/amazing-feature`)
8. **Create** a Pull Request with detailed description

### Code Standards

- **Python**: Follow PEP 8, use type hints, comprehensive docstrings
- **TypeScript**: Strict mode, proper typing, ESLint compliance
- **Testing**: Unit tests for all new functionality
- **Security**: Input validation, sanitization, and security reviews
- **Documentation**: Update README, code comments, and API docs

### Testing Requirements

```bash
# Backend tests
cd Backend
python -m pytest tests/ -v --coverage

# Frontend tests
cd Frontend
npm run test
npm run test:e2e

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📈 Roadmap

### Version 2.0 (Q3 2025)
- [ ] **Multi-Agent Orchestration**: Deploy and coordinate multiple specialized agents
- [ ] **Visual Workflow Builder**: Drag-and-drop interface for complex task automation
- [ ] **Advanced Security Sandbox**: Isolated execution environments with fine-grained permissions
- [ ] **Cloud Provider Integration**: Native AWS, GCP, Azure service integrations
- [ ] **Real-time Collaboration**: Multi-user sessions with conflict resolution

### Version 1.5 (Q2 2025)
- [ ] **Enhanced Shell Tools**: Improved command validation and cross-platform support
- [ ] **Plugin Architecture**: Extensible framework for custom tool development
- [ ] **Performance Dashboard**: Real-time metrics, monitoring, and analytics
- [ ] **Backup & Recovery**: Automated session backup and restoration
- [ ] **Mobile Interface**: Responsive design for tablet and mobile access

### Version 1.2 (Current)
- [x] **Multi-LLM Support**: OpenAI, Anthropic, Google, Together AI integration
- [x] **Memory Condensation**: Advanced context management and optimization
- [x] **VS Code Integration**: Full-featured web-based IDE
- [x] **Real-time Communication**: SSE streaming and WebSocket support
- [x] **Docker Distribution**: Automated builds and Docker Hub distribution

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Omniroot Agent Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **LangChain** for the powerful and flexible agent framework
- **LiteLLM** for seamless multi-provider LLM integration and standardization
- **FastAPI** for high-performance async API development
- **React & TypeScript** for modern, type-safe frontend development
- **Docker** for containerization and deployment simplification
- **VS Code** for the integrated development environment
- **Open Source Community** for continuous inspiration, feedback, and contributions

## 📞 Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/omniroot-agent/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-username/omniroot-agent/discussions)
- **📖 Documentation**: [Wiki](https://github.com/your-username/omniroot-agent/wiki)
- **📧 Email**: support@omniroot-agent.com
- **🐦 Twitter**: [@OmnirootAgent](https://twitter.com/omnirootagent)
- **💬 Discord**: [Join our community](https://discord.gg/omniroot-agent)

### FAQ

**Q: Can I run this on Windows or macOS?**
A: The container can run on Docker Desktop for Windows/macOS, but some privileged operations may not work as expected. Linux is recommended for full functionality.

**Q: How much does it cost to run?**
A: The container itself is free. You only pay for LLM API usage based on your chosen providers and usage patterns.

**Q: Is my data secure?**
A: All processing happens locally in your container. No data is sent to external services except for LLM API calls. Use API keys with appropriate restrictions.

**Q: Can I add custom tools?**
A: Yes! The agent supports custom tool development. See the development section for guidelines.

---

<div align="center">

**⭐ Star this repository if you find it useful!**

**🤝 Contributions are always welcome and highly appreciated!**

**🔐 Always use responsibly and in secure environments!**

[![GitHub stars](https://img.shields.io/github/stars/your-username/omniroot-agent.svg?style=social&label=Star)](https://github.com/your-username/omniroot-agent)
[![GitHub forks](https://img.shields.io/github/forks/your-username/omniroot-agent.svg?style=social&label=Fork)](https://github.com/your-username/omniroot-agent/fork)
[![Docker Pulls](https://img.shields.io/docker/pulls/jahanzeb833/omniroot-agent.svg)](https://hub.docker.com/r/jahanzeb833/omniroot-agent)

</div>

---

> **⚠️ Disclaimer**: Omniroot Agent is a powerful tool that requires responsible usage. The developers assume no responsibility for any damage, data loss, or security breaches resulting from improper use. Always follow security best practices, use in isolated environments, and ensure you understand the implications of granting root-level system access to an AI agent. This software is provided "as-is" without warranties of any kind.
