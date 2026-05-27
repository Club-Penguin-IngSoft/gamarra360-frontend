import brandLogo from '../assets/images/brand-logo.svg';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
};

export default function Logo({ size = 'md' }: LogoProps) {
  const sizeClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-17' : 'h-10';

  return (
    <img
      src={brandLogo}
      alt="Gamarra 360"
      className={`${sizeClass} w-auto`}
      decoding="async"
    />
  );
}
