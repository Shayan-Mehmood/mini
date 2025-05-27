import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import { Link } from 'react-router';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = [
    // { name: 'Dashboard', to: '/dashboard' },
    { name: 'AI Coach', to: 'https://minilessonsacademy.com/members-area/ai-tools/' },
    // { name: 'Marketing Resources', to: '/dashboard/marketing-resources' },
    { name: 'Marketing Resources', to: 'https://minilessonsacademy.com/members-area/marketing-vip-resources-hub/' },
    { name: 'Knowledgebase', to: 'https://minilessonsacademy.com/members-area/knowledgebase/' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <img
            src="https://files.minilessonsacademy.com/mla_logo.png"
            alt="Logo"
            className="h-8 sm:h-10 w-auto"
          />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Navigation links */}
        <nav
          className={`absolute top-24 left-0 w-full bg-white md:static md:flex border-t md:border-none md:justify-end ${
            isMenuOpen ? 'block z-50' : 'hidden'
          }`}
        >
          <ul className="flex flex-col md:flex-row md:items-center p-4 md:p-0 space-y-2 md:space-y-0 md:space-x-6">
            {navigation.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.to}
                  className={
                    `flex items-center text-gray-700 hover:text-primary  active:text-primary font-semibold
                    `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="https://minilessonsacademy.com/my-account/"
                className={
                  `flex items-center text-gray-700 hover:text-primary  active:text-primary font-semibold
                  `}
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-1" />
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;