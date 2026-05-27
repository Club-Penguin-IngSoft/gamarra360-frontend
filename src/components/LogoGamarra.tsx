import logoSrc from '../assets/logo.svg';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoGamarraProps {
  size?: LogoSize;
  className?: string;
}

const heightMap: Record<LogoSize, string> = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
};

const LogoGamarra = ({ size = 'md', className = '' }: LogoGamarraProps) => {
  return (
    <img
      src={logoSrc}
      alt="Gamarra 360°"
      className={`${heightMap[size]} w-auto object-contain ${className}`}
      draggable={false}
    />
  );
};

export default LogoGamarra;
