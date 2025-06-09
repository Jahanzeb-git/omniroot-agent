import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, Shield, Settings, Zap, Database, Code, Users, AlertTriangle, Scale, BookOpen, User, Globe, Mail, Linkedin, Github, ExternalLink, Container, Server, Cpu, FileText, Star, GitBranch, Download, Play, Terminal, Eye, Wrench } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('technical');

  // Scroll to top when section changes
  useEffect(() => {
    const contentElement = document.getElementById('modal-content');
    if (contentElement) {
      contentElement.scrollTop = 0;
    }
  }, [activeSection]);

  if (!isOpen) return null;

  const sections = [
    { id: 'technical', label: 'Technical Development', icon: Code },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'guidelines', label: 'User Guidelines', icon: Users },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
    { id: 'terms', label: 'Terms & Conditions', icon: Shield },
    { id: 'licensing', label: 'Licensing', icon: Scale },
    { id: 'readme', label: 'README', icon: BookOpen },
    { id: 'developer', label: 'Developer Info', icon: User }
  ];

  const renderTechnicalSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Architecture Overview</h4>
        <p className="text-blue-800 mb-4">Built on a modern, scalable architecture designed for high-performance AI agent operations with containerized deployment and multi-LLM integration.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-semibold text-gray-900 mb-2">Frontend Stack</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• React 18 with TypeScript</li>
              <li>• Modern component architecture</li>
              <li>• Real-time streaming UI</li>
              <li>• Responsive design system</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-semibold text-gray-900 mb-2">Backend Stack</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• FastAPI (Python) REST API</li>
              <li>• SQLite persistent storage</li>
              <li>• Langchain LLM integration</li>
              <li>• Real-time event streaming</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Core Implementation</h4>
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">LLM Integration</h5>
            <p className="text-gray-600 text-sm">Langchain orchestrates multi-provider LLM access with dynamic model switching, context management, and token optimization across OpenAI, Anthropic, Google, and open-source models.</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Memory Management</h5>
            <p className="text-gray-600 text-sm">ConversationSummaryMemory with custom condensation algorithms retain maximum context while minimizing token usage for cost-effective operations.</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Tool Ecosystem</h5>
            <p className="text-gray-600 text-sm">Modular tool architecture enables file operations, shell execution, email sending, and development workflows with built-in safety validations.</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Containerization with Docker</h5>
            <p className="text-gray-600 text-sm">Secure containerized environment with isolated filesystem access, multi-stage builds, and integrated VS Code Web IDE for safe development operations.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesSection = () => (
    <div className="space-y-4">
      {[
        { title: 'Multi-LLM Support', desc: 'OpenAI GPT-4/o1, Anthropic Claude 3.5/4, Google Gemini 2.5, and Together AI open-source models with seamless switching', color: 'blue' },
        { title: 'Dynamic Prompting', desc: 'Intelligent prompt adjustment with violation warnings and strategic decision-making guidance', color: 'green' },
        { title: 'Dynamic Memory Management', desc: 'ConversationSummaryMemory with custom condensation for optimal context retention', color: 'purple' },
        { title: 'File Watching', desc: 'Real-time tracking of user-induced file changes to maintain contextual awareness', color: 'orange' },
        { title: 'Session Management', desc: 'Complete session lifecycle with creation, listing, deletion, and detailed history retrieval', color: 'indigo' },
        { title: 'Containerized Environment', desc: 'Secure Docker container with isolated filesystem and integrated VS Code Web IDE', color: 'cyan' },
        { title: 'Comprehensive Tools', desc: 'WriteFile, ReadFile, Shell, Email, and Development tools with safety validations within container scope', color: 'teal' }
      ].map((feature, idx) => (
        <div key={idx} className={`p-4 rounded-lg border-l-4 border-${feature.color}-500 bg-${feature.color}-50`}>
          <h4 className={`font-semibold text-${feature.color}-900 mb-2`}>{feature.title}</h4>
          <p className={`text-${feature.color}-800 text-sm`}>{feature.desc}</p>
        </div>
      ))}
    </div>
  );

  const renderGuidelinesSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h4 className="text-lg font-semibold text-green-900 mb-4">Getting Started</h4>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Launch Container', desc: 'Run Docker container with: docker run -d -p 5173:5173 -p 5001:5001 -p 8080:8080 jahanzeb833/omniroot-agent:latest' },
            { step: '2', title: 'Access Application', desc: 'Navigate to localhost:5173 in your browser' },
            { step: '3', title: 'Configure Settings', desc: 'Click "Settings" in sidebar, select your preferred LLM model and enter API key' },
            { step: '4', title: 'Save Configuration', desc: 'Click "Save Settings" and close the settings panel' },
            { step: '5', title: 'Start Developing', desc: 'Access VS Code IDE at localhost:8080 and begin interacting with the agent' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {item.step}
              </div>
              <div>
                <h5 className="font-medium text-green-900">{item.title}</h5>
                <p className="text-green-700 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">Navigation Features</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Session Management</h5>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Click "New Chat" for fresh sessions</li>
              <li>• Use "History" to resume past sessions</li>
              <li>• Delete unwanted sessions safely</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Advanced Features</h5>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Real-time command execution feedback</li>
              <li>• Integrated VS Code Web IDE</li>
              <li>• Container-isolated development environment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTroubleshootingSection = () => (
    <div className="space-y-4">
      {[
        { error: 'Container fails to start', solution: 'Check port availability (5173, 5001, 8080) and ensure Docker is running with sufficient resources', severity: 'high' },
        { error: 'Initial access errors', solution: 'Configure LLM settings on first-time access and verify API key validity', severity: 'medium' },
        { error: 'Agent stuck in task', solution: 'Reload page or create new session to reset agent state', severity: 'medium' },
        { error: 'Task not processing', solution: 'Check API credit balance, rate limits, and network connectivity', severity: 'high' },
        { error: 'Error 500', solution: 'Restart Docker container and check system resources availability', severity: 'high' },
        { error: 'Error 404', solution: 'Re-configure settings, especially API key and model selection', severity: 'medium' },
        { error: 'Email sending failure', solution: 'Configure app-specific password in email settings within container', severity: 'low' },
        { error: 'VS Code IDE not loading', solution: 'Ensure port 8080 is accessible and container has sufficient memory', severity: 'medium' }
      ].map((item, idx) => (
        <div key={idx} className={`p-4 rounded-lg border-l-4 ${
          item.severity === 'high' ? 'border-red-500 bg-red-50' :
          item.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
          'border-blue-500 bg-blue-50'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            item.severity === 'high' ? 'text-red-900' :
            item.severity === 'medium' ? 'text-yellow-900' :
            'text-blue-900'
          }`}>{item.error}</h4>
          <p className={`text-sm ${
            item.severity === 'high' ? 'text-red-800' :
            item.severity === 'medium' ? 'text-yellow-800' :
            'text-blue-800'
          }`}>{item.solution}</p>
        </div>
      ))}
    </div>
  );

  const renderTermsSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
        <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          Important Disclaimer
        </h4>
        <div className="space-y-4 text-red-800">
          <p className="font-medium">
            By using the Omniroot Agent, you acknowledge and accept full responsibility for any consequences arising from its use within the containerized environment.
          </p>
          <div className="bg-white p-4 rounded border border-red-200">
            <h5 className="font-semibold mb-2 text-red-900">Development Use Only</h5>
            <ul className="text-sm space-y-2">
              <li>• This tool is NOT ready for production use or commercial deployment</li>
              <li>• Intended for development, testing, and educational purposes only</li>
              <li>• Beta software may contain bugs or unexpected behavior</li>
              <li>• Performance depends on chosen LLM model and API response times</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border border-red-200">
            <h5 className="font-semibold mb-2 text-red-900">Limitation of Liability</h5>
            <ul className="text-sm space-y-2">
              <li>• Developer bears NO responsibility for any misuse of this tool</li>
              <li>• Any data loss, service interruption, or unintended consequences are user's responsibility</li>
              <li>• Containerized environment limits but does not eliminate all risks</li>
              <li>• Users must ensure compliance with LLM provider terms and applicable laws</li>
            </ul>
          </div>
          <p className="text-sm">
            This software is provided "as-is" without warranties of any kind. While containerized for safety, users should exercise caution and maintain proper backups of critical data.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Containerized Safety</h4>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Operations are isolated within Docker container environment</li>
          <li>• Host system files and processes remain protected</li>
          <li>• Container-level access only, no host system privileges</li>
          <li>• Monitor container resource usage and API consumption</li>
          <li>• Keep API keys secure and rotate them regularly</li>
          <li>• Review generated code and commands before execution</li>
        </ul>
      </div>
    </div>
  );

  const renderLicensingSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
          <Scale className="mr-2" size={20} />
          MIT License
        </h4>
        <div className="space-y-4 text-green-800">
          <p>
            The Omniroot Agent is released under the MIT License, one of the most permissive open-source licenses available.
          </p>
          <div className="bg-white p-4 rounded border border-green-200">
            <h5 className="font-semibold mb-2 text-green-900">Permissions</h5>
            <ul className="text-sm space-y-1">
              <li>✓ Commercial use (when production-ready)</li>
              <li>✓ Modification</li>
              <li>✓ Distribution</li>
              <li>✓ Private use</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border border-green-200">
            <h5 className="font-semibold mb-2 text-green-900">Requirements</h5>
            <ul className="text-sm space-y-1">
              <li>• Include original license and copyright notice</li>
              <li>• Preserve attribution in derivative works</li>
            </ul>
          </div>
          <p className="text-sm">
            For the complete license text and legal details, please refer to the LICENSE file in the project repository.
          </p>
        </div>
      </div>
    </div>
  );

  const renderReadmeSection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🤖 Omniroot Agent</h1>
        <p className="text-xl text-gray-600 mb-6">Advanced AI assistant with containerized system access and multi-LLM support</p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {[
            { name: 'Docker', color: 'blue' },
            { name: 'MIT License', color: 'yellow' },
            { name: 'Python', color: 'blue' },
            { name: 'LangChain', color: 'gray' },
            { name: 'React', color: 'cyan' },
            { name: 'TypeScript', color: 'blue' },
            { name: 'v1.3.0', color: 'green' }
          ].map((badge, idx) => (
            <span key={idx} className={`px-3 py-1 bg-${badge.color}-100 text-${badge.color}-800 text-sm font-medium rounded-full`}>
              {badge.name}
            </span>
          ))}
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">
            🛡️ SECURE CONTAINERIZED ENVIRONMENT: This agent operates within a secure Docker container with isolated access to its own environment. Safe for development and testing without compromising host system security.
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">🎯 Overview</h2>
        <p className="text-blue-800">
          Omniroot Agent is a sophisticated, containerized Agentic AI application built with LangChain and LiteLLM that provides autonomous task execution with multi-LLM support. Designed for secure development environments, this agent combines the power of multiple AI models with containerized access to solve complex coding tasks, development workflows, and automation challenges.
        </p>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="text-blue-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Multi-LLM Intelligence Hub</h3>
            </div>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• OpenAI Models: GPT-4, GPT-o1, GPT-o1-mini, GPT-o3</li>
              <li>• Anthropic Claude: Claude 3.5 Sonnet, Claude 4 Series</li>
              <li>• Google Gemini: Gemini 2.5 Pro, Gemini 1.5 Pro</li>
              <li>• Open Source: Together AI's Qwen 2.5, Deepseek V3</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Container className="text-green-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Containerized Development</h3>
            </div>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Secure isolated container environment</li>
              <li>• Full filesystem operations within container scope</li>
              <li>• Integrated VS Code Web IDE</li>
              <li>• No host system access - maintains security boundaries</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Cpu className="text-purple-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Memory Management</h3>
            </div>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Contextual Memory Condensation</li>
              <li>• Dynamic Context Optimization</li>
              <li>• Session Persistence</li>
              <li>• Workflow State Management</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Terminal className="text-orange-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Real-Time Communication</h3>
            </div>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Server-Sent Events (SSE): Streaming responses</li>
              <li>• WebSocket Integration</li>
              <li>• REST API: Comprehensive HTTP endpoints</li>
              <li>• Event-Driven Architecture</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Start</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">One-Command Installation</h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
              docker run -d --name omniroot-agent -p 5173:5173 -p 5001:5001 -p 8080:8080 jahanzeb833/omniroot-agent:latest
            </div>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Access the Application</h3>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>🌐 Frontend Interface: http://localhost:5173</li>
              <li>🔗 Backend API: http://localhost:5001</li>
              <li>💻 VS Code IDE: http://localhost:8080</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Metric</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Value</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { metric: 'Container Startup Time', value: '15-30 seconds', notes: 'Initial container initialization' },
                { metric: 'LLM Response Time', value: '1-10 seconds', notes: 'Varies by model complexity and API latency' },
                { metric: 'Memory Usage', value: '1-4 GB', notes: 'Depends on active projects and context size' },
                { metric: 'Container Size', value: '~2 GB', notes: 'Includes all dependencies and tools' },
                { metric: 'Context Retention', value: '85-95%', notes: 'With memory condensation enabled' }
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.metric}</td>
                  <td className="px-4 py-3 text-gray-700">{row.value}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-200 pt-8">
        <div className="flex justify-center space-x-4 mb-4">
          <span className="flex items-center text-yellow-600">
            <Star className="mr-1" size={16} />
            Star this repository if you find it useful!
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          💡 Note: Omniroot Agent v1.3.0 operates within a secure containerized environment, making it safe for development and testing without compromising host system security.
        </p>
      </div>
    </div>
  );

  const renderDeveloperSection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-white" size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jahanzeb Ahmed</h1>
        <p className="text-lg text-gray-600 mb-4">Data Scientist</p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Passionate about building innovative AI solutions and modern web applications. Creator of Omniroot Agent and various other open-source projects.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center mb-4">
            <Globe className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-blue-900">Portfolio Website</h3>
          </div>
          <p className="text-blue-700 mb-4">Check out my portfolio and other projects</p>
          <button 
            onClick={() => window.open('https://jahanzebahmed.netlify.app', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            Visit Website
            <ExternalLink className="ml-2" size={16} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center mb-4">
            <Mail className="text-red-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-red-900">Email Contact</h3>
          </div>
          <p className="text-red-700 mb-4">Get in touch for collaborations or inquiries</p>
          <button 
            onClick={() => window.open('mailto:jahanzebahmed.mail@gmail.com', '_blank')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            Send Email
            <Mail className="ml-2" size={16} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-linkedin-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center mb-4">
            <Linkedin className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-blue-900">LinkedIn Profile</h3>
          </div>
          <p className="text-blue-700 mb-4">Connect with me professionally</p>
          <button 
            onClick={() => window.open('https://www.linkedin.com/in/2024-jahanzebahmed/', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            Connect on LinkedIn
            <ExternalLink className="ml-2" size={16} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Github className="text-gray-700 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">GitHub Profile</h3>
            </div>
          <p className="text-gray-700 mb-4">Explore my open-source projects and contributions</p>
          <button 
            onClick={() => window.open('https://github.com/jahanzeb833', '_blank')}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            View GitHub
            <ExternalLink className="ml-2" size={16} />
          </button>
        </div>
      </div>

      {/* Skills & Technologies */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Technologies</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Frontend</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vue.js'].map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Backend</h4>
            <div className="flex flex-wrap gap-2">
              {['Python', 'FastAPI', 'Node.js', 'Express', 'Django'].map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">AI & Tools</h4>
            <div className="flex flex-wrap gap-2">
              {['LangChain', 'OpenAI', 'Docker', 'Git', 'AWS'].map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Highlights */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Highlights</h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">🤖 Omniroot Agent</h4>
            <p className="text-gray-700 text-sm mb-2">Advanced AI assistant with containerized system access and multi-LLM support</p>
            <div className="flex flex-wrap gap-2">
              {['Python', 'React', 'Docker', 'LangChain', 'FastAPI'].map((tech, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">🌐 Portfolio Website</h4>
            <p className="text-gray-700 text-sm mb-2">Modern, responsive portfolio showcasing projects and skills</p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'].map((tech, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-200 pt-6">
        <p className="text-gray-600 mb-2">
          "Building the future, one line of code at a time."
        </p>
        <p className="text-gray-500 text-sm">
          Always open to interesting projects and collaborations!
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'technical':
        return renderTechnicalSection();
      case 'features':
        return renderFeaturesSection();
      case 'guidelines':
        return renderGuidelinesSection();
      case 'troubleshooting':
        return renderTroubleshootingSection();
      case 'terms':
        return renderTermsSection();
      case 'licensing':
        return renderLicensingSection();
      case 'readme':
        return renderReadmeSection();
      case 'developer':
        return renderDeveloperSection();
      default:
        return renderTechnicalSection();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Documentation</h2>
            <p className="text-gray-600 text-sm mt-1">Comprehensive guide and reference</p>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3" size={18} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {sections.find(s => s.id === activeSection)?.label}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          <div id="modal-content" className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;