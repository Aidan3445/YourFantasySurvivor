import { type SVGProps, forwardRef } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

/**
 * Creates a custom icon component with the same API and type as lucide-react icons.
 * Used by the generate-icons script — not typically called directly.
 */
export function createIcon(
  displayName: string,
  viewBox: string,
  paths: React.FC,
) {
  const Paths = paths;

  const Icon = forwardRef<SVGSVGElement, IconProps>(
    (
      {
        size = 24,
        color = 'currentColor',
        strokeWidth = 0,
        absoluteStrokeWidth = false,
        fill = 'currentColor',
        className,
        style,
        ...rest
      },
      ref,
    ) => {
      const computedStrokeWidth = absoluteStrokeWidth
        ? Number(strokeWidth)
        : Number(strokeWidth) * (24 / Number(size));

      return (
        <svg
          ref={ref}
          xmlns='http://www.w3.org/2000/svg'
          width={size}
          height={size}
          viewBox={viewBox}
          fill={fill}
          stroke={color}
          strokeWidth={computedStrokeWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
          className={className}
          style={style}
          {...rest}>
          <Paths />
        </svg>
      );
    },
  );

  Icon.displayName = displayName;
  return Icon;
}
