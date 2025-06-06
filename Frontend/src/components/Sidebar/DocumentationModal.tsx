import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown, Shield, Settings, Zap, Database, Code, Users, AlertTriangle, Scale } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('technical');

  if (!isOpen) return null;

  const sections = [
    { id: 'technical', label: 'Technical Development', icon: Code },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'guidelines', label: 'User Guidelines', icon: Users },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
    { id: 'terms', label: 'Terms & Conditions', icon: Shield },
    { id: 'licensing', label: 'Licensing', icon: Scale }
  ];

  const renderTechnicalSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Architecture Overview</h4>
        <p className="text-blue-800 mb-4">Built on a modern, scalable architecture designed for high-performance AI agent operations with full system integration.</p>
        
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
              <li>• Flask (Python) REST API</li>
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
            <p className="text-gray-600 text-sm">Langchain orchestrates multi-provider LLM access with dynamic model switching, context management, and token optimization.</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Memory Management</h5>
            <p className="text-gray-600 text-sm">ConversationSummaryMemory with custom condensation algorithms retain maximum context while minimizing token usage for cost-effective operations.</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Tool Ecosystem</h5>
            <p className="text-gray-600 text-sm">Modular tool architecture enables file operations, shell execution, email sending, and browser automation with built-in safety validations.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesSection = () => (
    <div className="space-y-4">
      {[
        { title: 'Multi-LLM Support', desc: 'OpenAI, Anthropic, Gemini, and Together AI open-source models with seamless switching', color: 'blue' },
        { title: 'Dynamic Prompting', desc: 'Intelligent prompt adjustment with violation warnings and strategic decision-making guidance', color: 'green' },
        { title: 'Dynamic Memory Management', desc: 'ConversationSummaryMemory with custom condensation for optimal context retention', color: 'purple' },
        { title: 'File Watching', desc: 'Real-time tracking of user-induced file changes to maintain contextual awareness', color: 'orange' },
        { title: 'Session Management', desc: 'Complete session lifecycle with creation, listing, deletion, and detailed history retrieval', color: 'indigo' },
        { title: 'Root Access', desc: 'Full operating system and file system access with elevated privileges', color: 'red' },
        { title: 'Comprehensive Tools', desc: 'WriteFile, ReadFile, Shell, Browser, Git, Drive, and Email tools with safety validations', color: 'teal' }
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
            { step: '1', title: 'Access Application', desc: 'Navigate to localhost:5173 in your browser' },
            { step: '2', title: 'Configure Settings', desc: 'Click "Settings" in sidebar, select your preferred LLM model and enter API key' },
            { step: '3', title: 'Save Configuration', desc: 'Click "Save Settings" and close the settings panel' },
            { step: '4', title: 'Start Interacting', desc: 'Enter queries like "Find current working directory" and click send' },
            { step: '5', title: 'Monitor Progress', desc: 'Watch real-time task processing and streaming responses' }
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
              <li>• Delete unwanted sessions</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Advanced Features</h5>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Real-time command execution feedback</li>
              <li>• File change monitoring</li>
              <li>• Context-aware interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTroubleshootingSection = () => (
    <div className="space-y-4">
      {[
        { error: 'Failed to reset session', solution: 'Verify API key and model configuration in settings', severity: 'high' },
        { error: 'Initial access errors', solution: 'Configure settings on first-time access', severity: 'medium' },
        { error: 'Agent stuck in task', solution: 'Reload page or create new session', severity: 'medium' },
        { error: 'Task not processing', solution: 'Check API credit balance and quota limits', severity: 'high' },
        { error: 'Error 500', solution: 'Restart Docker container and check system resources', severity: 'high' },
        { error: 'Error 404', solution: 'Re-configure settings, especially API key and model selection', severity: 'medium' },
        { error: 'Email sending failure', solution: 'Configure app-specific password in email settings', severity: 'low' },
        { error: 'Drive access issues', solution: 'Complete Google Drive authentication process', severity: 'low' }
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
            By using the OmniRoot Agent, you acknowledge and accept full responsibility for any consequences arising from its use.
          </p>
          <div className="bg-white p-4 rounded border border-red-200">
            <h5 className="font-semibold mb-2 text-red-900">Limitation of Liability</h5>
            <ul className="text-sm space-y-2">
              <li>• We bear NO responsibility for any harm to your operating system or file system</li>
              <li>• Any direct or indirect damage, data loss, or system corruption is solely your responsibility</li>
              <li>• Financial losses, business interruption, or any other damages are not our liability</li>
              <li>• Root access capabilities require careful and informed usage</li>
            </ul>
          </div>
          <p className="text-sm">
            This software is provided "as-is" without warranties of any kind. Use at your own risk and ensure you have proper backups before performing system-level operations.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Usage Guidelines</h4>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Always maintain system backups before using root-level operations</li>
          <li>• Review and understand commands before execution</li>
          <li>• Monitor system resources and API usage limits</li>
          <li>• Keep API keys secure and rotate them regularly</li>
          <li>• Use appropriate models for your specific use cases</li>
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
            The OmniRoot Agent is released under the MIT License, one of the most permissive open-source licenses available.
          </p>
          <div className="bg-white p-4 rounded border border-green-200">
            <h5 className="font-semibold mb-2 text-green-900">Permissions</h5>
            <ul className="text-sm space-y-1">
              <li>✓ Commercial use</li>
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

  const renderContent = () => {
    switch (activeSection) {
      case 'technical': return renderTechnicalSection();
      case 'features': return renderFeaturesSection();
      case 'guidelines': return renderGuidelinesSection();
      case 'troubleshooting': return renderTroubleshootingSection();
      case 'terms': return renderTermsSection();
      case 'licensing': return renderLicensingSection();
      default: return renderTechnicalSection();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Documentation</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <nav className="space-y-2">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeSection === id
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} className="mr-3" />
                <span className="font-medium">{label}</span>
                {activeSection === id ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">OmniRoot Agent</h1>
              <p className="text-gray-600">Advanced AI assistant with root system access and multi-LLM support</p>
            </div>
            
            <div className="prose max-w-none">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;