import React from 'react';
import Link from 'next/link';

interface BackToHomeButtonProps {
  className?: string;
  showIcon?: boolean;
  text?: string;
}

/**
 * 返回首页按钮组件
 * 用于在各个页面中提供返回首页的导航功能
 */
export default function BackToHomeButton({
  className = '',
  showIcon = true,
  text = '返回首页'
}: BackToHomeButtonProps) {
  return (
    <Link 
      href="/" 
      className={`inline-flex items-center px-3 py-1.5 rounded-md bg-white dark:bg-[#23232a] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a32] transition-colors border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      {showIcon && (
        <span className="mr-1.5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
      )}
      <span>{text}</span>
    </Link>
  );
}