// Utilidad para convertir nombres de colores en clases de Tailwind
// Esto facilita el uso dinámico de colores en componentes

export const TAG_COLOR_CLASSES: Record<string, {
  bg: string;
  text: string;
  border: string;
}> = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20'
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20'
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20'
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20'
  }
};

export function getTagColorClasses(color: string): string {
  const colorClasses = TAG_COLOR_CLASSES[color] || TAG_COLOR_CLASSES.indigo;
  return `${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`;
}
