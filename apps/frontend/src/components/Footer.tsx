import { Rocket } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="border-t border-purple-500/20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center space-x-2">
            <Rocket className="h-4 w-4 text-purple-400" />
            <span>SpaceApp © 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-green-400">●</span>
            <span>42k Explorers Online</span>
            <Link to="#" className="hover:text-purple-400 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-purple-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;