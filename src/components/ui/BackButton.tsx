import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from './button';

interface BackButtonProps {
  onBeforeNavigate?: () => boolean | Promise<boolean>;
  label?: string;
  iconSize?: number;
  className?: string;
  variant?: "outline" | "soft" | "ghost";
    size?: 'sm' | 'md' | 'lg' | 'xl';
  href:string
}

const BackButton: React.FC<BackButtonProps> = ({
  onBeforeNavigate,
  label = 'Back',
  iconSize = 16,
  className = '',
  variant = 'outline',
  size = 'sm',
  href="",
  ...props
}) => {
  const navigate = useNavigate();

  const handleGoBack = async () => {
    try {
      // If there's a check function, run it first
      if (onBeforeNavigate) {
        const shouldProceed = await Promise.resolve(onBeforeNavigate());
        if (!shouldProceed) return;
      }
      
      // Navigate back
      if(href){
        navigate('/dashboard')
      }else{
        navigate(-1);
      }
    } catch (error) {
      console.error('Error navigating back:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoBack}
      className={`gap-1.5 max-w-[200px] bg-purple-600 text-[12px] font-medium text-white`}
      {...props}
    >
      <ArrowLeft className={`w-${iconSize/4} h-${iconSize/4}`} />
      {/* {label && <span>{label}</span>}
       */}
       Go Back
    </Button>
  );
};

export default BackButton;