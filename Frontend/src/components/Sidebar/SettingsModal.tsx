import React, { useState, useEffect } from 'react';
import { 
  X, 
  Brain, 
  Key, 
  Mail, 
  Percent,
  User, 
  Check,
  ChevronDown,
  Info,
  Settings,
  Timer,
  Thermometer,
  Hash,
  RefreshCw,
  Server
} from 'lucide-react';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsData {
  id?: number;
  model: string;
  openai_api_key: string;
  anthropic_api_key: string;
  google_api_key: string;
  together_api_key: string;
  summarization_percentage: number;
  smtp_email: string;
  smtp_password: string;
  smtp_host: string;
  smtp_port: number;
  use_tls: boolean;
  user_name: string;
  theme: string;
  max_iterations: number;
  llm_temperature: number;
  llm_max_tokens: number;
  llm_timeout: number;
  os?: string;
  kernel_version?: string;
}

const MODEL_OPTIONS = [
  { value: 'openai/gpt-4', label: 'OpenAI GPT-4' },
  { value: 'openai/gpt-o1', label: 'OpenAI GPT-o1' },
  { value: 'openai/gpt-o1-mini', label: 'OpenAI GPT-o1 Mini' },
  { value: 'openai/gpt-o3', label: 'OpenAI GPT-o3' },
  { value: 'anthropic/claude-3-7-sonnet-latest', label: 'Anthropic Claude 3.7 Sonnet' },
  { value: 'anthropic/claude-sonnet-4', label: 'Anthropic Claude 4 Sonnet' },
  { value: 'anthropic/claude-opus-4', label: 'Anthropic Claude 4 Opus' },
  { value: 'google/gemini-1.5-pro', label: 'Google Gemini 1.5 Pro' },
  { value: 'google/gemini-2.5-pro', label: 'Google Gemini 2.5 Pro' },
  { value: 'together/Qwen/Qwen2.5-Coder-32B-Instruct', label: 'Qwen 2.5 Coder' },
  { value: 'together/Qwen/Qwen3-235B-A22B-fp8-tput', label: 'Qwen 3' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const DEFAULT_SETTINGS: SettingsData = {
  model: 'openai/gpt-4',
  openai_api_key: '',
  anthropic_api_key: '',
  google_api_key: '',
  together_api_key: '',
  summarization_percentage: 75,
  smtp_email: '',
  smtp_password: '',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  use_tls: true,
  user_name: '',
  theme: 'light',
  max_iterations: 10,
  llm_temperature: 0.1,
  llm_max_tokens: 1500,
  llm_timeout: 120
};

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => (
  <div className="group relative inline-block">
    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded-lg py-2 px-3 absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none">
      {text}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-800"></div>
    </div>
  </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = localStorage.getItem('settings');
        if (storedSettings) {
          try {
            setSettings(JSON.parse(storedSettings));
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse settings from localStorage:', e);
          }
        }

        const response = await fetch('http://localhost:5001/get_settings');
        if (response.status === 404) {
          setSettings(DEFAULT_SETTINGS);
        } else if (!response.ok) {
          throw new Error('Failed to fetch settings');
        } else {
          const data = await response.json();
          const newSettings = {
            ...DEFAULT_SETTINGS,
            ...data,
            use_tls: Boolean(data.use_tls)
          };
          setSettings(newSettings);
          localStorage.setItem('settings', JSON.stringify(newSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch('http://localhost:5001/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        localStorage.setItem('settings', JSON.stringify(settings));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedModelLabel = () => {
    return MODEL_OPTIONS.find(option => option.value === settings.model)?.label || settings.model;
  };

  const getSelectedThemeLabel = () => {
    return THEME_OPTIONS.find(option => option.value === settings.theme)?.label || settings.theme;
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setIsModelDropdownOpen(false);
      setIsThemeDropdownOpen(false);
    };

    if (isModelDropdownOpen || isThemeDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isModelDropdownOpen, isThemeDropdownOpen]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Model Selection */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">AI Model</h3>
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 hover:border-gray-400 transition-all duration-200"
                >
                  <span className="block truncate">{getSelectedModelLabel()}</span>
                  <ChevronDown className={clsx(
                    "absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200",
                    isModelDropdownOpen && "rotate-180"
                  )} />
                </button>
                
                {isModelDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {MODEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleInputChange('model', option.value);
                          setIsModelDropdownOpen(false);
                        }}
                        className={clsx(
                          'w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150',
                          settings.model === option.value && 'bg-blue-50 text-blue-700'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* API Keys */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">API Keys</h3>
                <Tooltip text="Enter your API keys for different AI providers. These keys are required to use their respective models." />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="password"
                  value={settings.openai_api_key}
                  onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
                  placeholder="OpenAI API Key"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <input
                  type="password"
                  value={settings.anthropic_api_key}
                  onChange={(e) => handleInputChange('anthropic_api_key', e.target.value)}
                  placeholder="Anthropic API Key"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <input
                  type="password"
                  value={settings.google_api_key}
                  onChange={(e) => handleInputChange('google_api_key', e.target.value)}
                  placeholder="Google API Key"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <input
                  type="password"
                  value={settings.together_api_key}
                  onChange={(e) => handleInputChange('together_api_key', e.target.value)}
                  placeholder="Together API Key"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
            </section>

            {/* LLM Settings */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">LLM Settings</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="text-sm text-gray-600">Temperature</label>
                    <Tooltip text="Controls randomness in the model's output. Higher values (0.8-1.0) make the output more creative but less focused, while lower values (0.1-0.4) make it more deterministic and focused." />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.llm_temperature}
                    onChange={(e) => handleInputChange('llm_temperature', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="text-sm text-gray-600">Max Tokens</label>
                    <Tooltip text="Maximum number of tokens (words/characters) the model can generate in a single response. Higher values allow for longer responses but may increase processing time and costs." />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={settings.llm_max_tokens}
                    onChange={(e) => handleInputChange('llm_max_tokens', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="text-sm text-gray-600">Timeout (seconds)</label>
                    <Tooltip text="Maximum time (in seconds) to wait for the model to generate a response before timing out." />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={settings.llm_timeout}
                    onChange={(e) => handleInputChange('llm_timeout', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="text-sm text-gray-600">Max Iterations</label>
                    <Tooltip text="Maximum number of back-and-forth interactions allowed in a single conversation. Helps prevent infinite loops and control costs." />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={settings.max_iterations}
                    onChange={(e) => handleInputChange('max_iterations', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>
            </section>

            {/* Performance */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <Percent className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">Performance</h3>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <label className="text-sm text-gray-600">Summarization %</label>
                  <Tooltip text="Percentage of the original text to retain in summaries. Lower values create more concise summaries, while higher values preserve more detail." />
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.summarization_percentage}
                  onChange={(e) => handleInputChange('summarization_percentage', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
            </section>

            {/* Email Settings */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">Email Configuration</h3>
                <Tooltip text="Configure SMTP settings for email notifications. These settings are required for sending email updates and alerts." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  value={settings.smtp_email}
                  onChange={(e) => handleInputChange('smtp_email', e.target.value)}
                  placeholder="SMTP Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <input
                  type="password"
                  value={settings.smtp_password}
                  onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                  placeholder="SMTP Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                  placeholder="SMTP Host"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                  placeholder="SMTP Port"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use_tls"
                  checked={settings.use_tls}
                  onChange={(e) => handleInputChange('use_tls', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="use_tls" className="text-sm text-gray-700">
                  Use TLS encryption
                </label>
                <Tooltip text="Enable TLS (Transport Layer Security) for secure email communication. Recommended for most SMTP servers." />
              </div>
            </section>

            {/* System Information */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">System Information</h3>
                <Tooltip text="System details about your environment. These values are read-only and automatically detected." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Operating System</div>
                  <div className="font-medium mt-1">{settings.os || 'Not detected'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Kernel Version</div>
                  <div className="font-medium mt-1">{settings.kernel_version || 'Not detected'}</div>
                </div>
              </div>
            </section>

            {/* Personal */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-700" />
                <h3 className="text-sm font-medium text-gray-900">Personal</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="text-sm text-gray-600">Display Name</label>
                    <Tooltip text="Your display name will be used in notifications and the user interface." />
                  </div>
                  <input
                    type="text"
                    value={settings.user_name}
                    onChange={(e) => handleInputChange('user_name', e.target.value)}
                    placeholder="Display Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <label className="text-sm text-gray-600">Theme</label>
                    <Tooltip text="Choose your preferred color theme for the application interface." />
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 hover:border-gray-400 transition-all duration-200"
                    >
                      <span className="block truncate">{getSelectedThemeLabel()}</span>
                      <ChevronDown className={clsx(
                        "absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200",
                        isThemeDropdownOpen && "rotate-180"
                      )} />
                    </button>
                    
                    {isThemeDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                        {THEME_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleInputChange('theme', option.value);
                              setIsThemeDropdownOpen(false);
                            }}
                            className={clsx(
                              'w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150',
                              settings.theme === option.value && 'bg-blue-50 text-blue-700'
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            {errorMessage && (
              <div className="text-red-600 text-sm">{errorMessage}</div>
            )}
            {saveSuccess && (
              <div className="flex items-center space-x-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Settings saved</span>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={clsx(
                'px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors',
                isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              )}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;