'use client';

// Simple utility function for combining classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface UserAvatarProps {
  name?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Use consistent #979797 background color for all avatars
function getAvatarColor(name: string): string {
  // Return empty string since we'll use inline styles
  return '';
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ name, username, size = 'md', className }: UserAvatarProps) {
  // Determine display name and initials
  const displayName = name || username || 'User';
  const initials = getInitials(displayName);
  const bgColor = getAvatarColor(displayName);
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm', 
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: '#979797', color: '#FFFFFF' }}
      title={displayName}
    >
      {initials}
    </div>
  );
}
