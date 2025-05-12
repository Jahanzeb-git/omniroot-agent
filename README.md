# Agentic Software-Development Tool

A Dockerized Agentic AI tool that provides a powerful interface for software development with AI assistance. This tool exposes two main capabilities:

1. **CodeEditor**: Read and write files in your filesystem
2. **Shell**: Execute bash commands in your environment

## Features

- **Full Home Directory Access**: Mounts your entire home directory for seamless file access
- **Persistent Memory**: Uses LangChain's ConversationBufferMemory to retain all chat and workflow state
- **Modern UI**: React frontend with Monaco Editor for code editing
- **Structured Workflows**: Organizes work into sessions, workflows, and steps
- **Multiple LLM Support**: Switch between different models from Huggingface, OpenAI, Anthropic, and Google
- **Model Configuration**: Easily configure model parameters and API keys through the UI

## Architecture

- **Backend**: Flask API with LangChain integration
- **Frontend**: React with Tailwind CSS (light theme)
- **Storage**: Persistent memory stored in `~/.agent_history/`

## Getting Started

### Prerequisites

- Docker and Docker Compose
- API tokens (all optional):
  - Huggingface API token (for Huggingface models)
  - OpenAI API key (for GPT models)
  - Anthropic API key (for Claude models)
  - Google API key (for Gemini models)

### Quick Installation (Recommended)

Run our one-line installer script:

```bash
curl -sSL https://raw.githubusercontent.com/yourusername/agentic-dev-tool/main/install.sh | bash
```

This will:
1. Download the necessary configuration
2. Pull the pre-built Docker image
3. Start the application

### Manual Installation

If you prefer to install manually:

1. Create a directory for the application:
   ```bash
   mkdir -p ~/agentic-dev-tool
   cd ~/agentic-dev-tool
   ```

2. Download the docker-compose.yml file:
   ```bash
   curl -O https://raw.githubusercontent.com/yourusername/agentic-dev-tool/main/docker-compose.user.yml
   mv docker-compose.user.yml docker-compose.yml
   ```

3. Set your Huggingface API token as an environment variable (optional):
   ```bash
   export HUGGINGFACEHUB_API_TOKEN=your_huggingface_token_here
   ```

4. Start the container:
   ```bash
   docker-compose up -d
   ```

5. Access the UI at http://localhost:3000

### Advanced Installation (For Developers)

If you want to modify the source code:

1. Clone this repository:
   ```bash
   git clone https://github.com/Jahanzeb-git/omniroot-agent.git
   cd agentic-dev-tool
   ```

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

3. Access the UI at http://localhost:3000

## Usage

### Chat Interface

Use the Chat tab to interact with the AI agent. The agent can:
- Answer questions about your codebase
- Generate code based on your requirements
- Execute shell commands to help with development tasks

### Code Editor

Use the Agentic Code tab to:
- Browse and edit files in your filesystem
- Save changes directly to your files
- Work with the AI to modify code

### Settings

Use the Settings tab to:
- Configure the AI model (Huggingface, OpenAI, Anthropic, Google)
- Set API keys for different providers
- Adjust model parameters (temperature, max length, etc.)
- View information about the application

## Example Workflows

### 1. Creating and Testing an Algorithm

```
User: Code an Insertion Sort algorithm in Python and test it.

Thought: I need to create the Python file for the algorithm.
Action: CodeEditor
Action Input: {"action":"write","file_path":"insertion_sort.py","content":"def insertion_sort(arr):\n    for i in range(1,len(arr)):\n        key=arr[i]\n        j=i-1\n        while j>=0 and arr[j]>key:\n            arr[j+1]=arr[j]\n            j-=1\n        arr[j+1]=key\n    return arr\n\nif __name__=='__main__':\n    print(insertion_sort([5,2,9,1,5,6]))\n"}
Observation: {"status":"success","message":"Wrote insertion_sort.py"}

Thought: The file is ready. Now test it.
Action: Shell
Action Input: python insertion_sort.py
Observation: {"exit_code":0,"stdout":"[1, 2, 5, 5, 6, 9]\n","stderr":""}

Thought: The output is correct. Return the final code.
```

### 2. Creating and Running Tests

```
User: Create and run a pytest for insertion_sort.

Thought: I should scaffold a test file.
Action: CodeEditor
Action Input: {"action":"write","file_path":"test_insertion_sort.py","content":"import pytest\nfrom insertion_sort import insertion_sort\n\ndef test_sorted():\n    assert insertion_sort([3,1,2])==[1,2,3]\n"}
Observation: {"status":"success","message":"Wrote test_insertion_sort.py"}

Thought: Now run pytest.
Action: Shell
Action Input: pytest --maxfail=1 --disable-warnings
Observation: {"exit_code":0,"stdout":"1 passed","stderr":""}

Thought: Tests passed. Report results.
Action: None
Final Answer:
✅ test_insertion_sort.py passed 1 test.
```

### 3. Finding Files in the Filesystem

```
User: I forgot where I saved credentials.pdf. Find it in my home directory.

Thought: I will search the mounted home folder.
Action: Shell
Action Input: find /host_home -type f -name 'credentials.pdf'
Observation: {"exit_code":0,"stdout":"/host_home/Documents/credentials.pdf\n","stderr":""}

Thought: Found the file path. Return it.
Action: None
Final Answer:
/home/username/Documents/credentials.pdf
```

## Technical Details

- The tool supports multiple AI models:
  - Huggingface models (Qwen3, Llama, Mistral, Gemma)
  - OpenAI models (GPT-3.5, GPT-4)
  - Anthropic models (Claude 3 Opus, Sonnet, Haiku)
  - Google models (Gemini Pro, Gemini Ultra)
- Model switching is handled through LiteLLM for a unified interface
- All interactions are stored in `~/.agent_history/history.txt`
- The Docker container exposes ports 3000 (React) and 5000 (Flask)

## License

MIT
