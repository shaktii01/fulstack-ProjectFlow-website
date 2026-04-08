import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const UserAvatar = ({
  src,
  name = '',
  alt,
  className,
  imageClassName,
  fallbackClassName,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const fallback = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  const showImage = Boolean(src) && !imageFailed;

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-full border border-border/50 bg-primary/10 font-bold text-primary shrink-0',
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          className={cn('h-full w-full object-cover', imageClassName)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={cn('leading-none', fallbackClassName)}>{fallback}</span>
      )}
    </div>
  );
};

export default UserAvatar;
