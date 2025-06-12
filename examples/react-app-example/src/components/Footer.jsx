import React from 'react';
import { Settings, Github, Book, Coffee } from 'lucide-react';

function Footer({ onReconfigure, config }) {
  return (
    <footer className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left side - Configuration info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Connected to: {config.endpoint}</span>
          </div>
          <div className="hidden md:block">•</div>
          <div className="flex items-center space-x-2">
            <span>Sample Rate: {config.sampleRate} Hz</span>
          </div>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onReconfigure}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Reconfigure</span>
          </button>
        </div>

        {/* Right side - Links */}
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/your-repo/gemini-live-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://your-docs-site.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Documentation"
          >
            <Book className="w-5 h-5" />
          </a>
          <a
            href="https://buymeacoffee.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Buy me a coffee"
          >
            <Coffee className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Bottom text */}
      <div className="text-center mt-6 text-sm text-gray-500">
        <p>
          Built with ❤️ using{' '}
          <span className="font-medium text-primary-600">Gemini Live SDK</span>
          {' • '}
          <span className="font-medium">React</span>
          {' • '}
          <span className="font-medium">Tailwind CSS</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;