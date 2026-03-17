declare module 'react-simple-maps' {
  import type { ReactNode, CSSProperties, MouseEvent } from 'react';

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    style?: CSSProperties;
    children?: ReactNode;
  }
  export const ComposableMap: (props: ComposableMapProps) => JSX.Element;

  interface GeographyItem {
    rsmKey: string;
    id: string;
    properties: Record<string, unknown>;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeographyItem[] }) => ReactNode;
  }
  export const Geographies: (props: GeographiesProps) => JSX.Element;

  interface GeographyStyle {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  interface GeographyProps {
    geography: GeographyItem;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: GeographyStyle;
    onMouseEnter?: (e: MouseEvent<SVGPathElement>) => void;
    onMouseMove?: (e: MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (e: MouseEvent<SVGPathElement>) => void;
    onClick?: (e: MouseEvent<SVGPathElement>) => void;
  }
  export const Geography: (props: GeographyProps) => JSX.Element;
}
