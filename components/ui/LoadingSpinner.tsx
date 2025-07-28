'use client';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'white';
};

export default function LoadingSpinner({ size = 'md', color = 'yellow' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    yellow: 'text-yellow-500',
    white: 'text-white',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{ borderTopColor: 'transparent' }}
      />
    </div>
  );
}
