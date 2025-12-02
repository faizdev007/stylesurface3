import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-800 hover:to-brand-600 text-white shadow-lg shadow-brand-900/20 border border-transparent focus:ring-brand-500",
    accent: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white shadow-lg shadow-accent-500/30 border border-transparent focus:ring-accent-500",
    secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 focus:ring-brand-500",
    outline: "bg-transparent border-2 border-brand-200 text-brand-900 hover:border-brand-600 hover:bg-brand-50 focus:ring-brand-500",
    white: "bg-white text-brand-900 hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md",
    ghost: "bg-transparent text-gray-600 hover:text-brand-700 hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base tracking-wide"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;