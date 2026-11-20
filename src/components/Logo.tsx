import { ClipboardTextIcon as ClipboardCheck } from '@phosphor-icons/react';

interface LogoProps {
  size?: 'sm' | 'md';
  tone?: 'dark' | 'light';
}

export default function Logo({ size = 'md', tone = 'dark' }: LogoProps) {
  const box = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl';
  const icon = size === 'sm' ? 17 : 21;
  const text = size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${box} ${tone === 'light' ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'} flex items-center justify-center shadow-sm`}>
        <ClipboardCheck size={icon} weight="fill" />
      </div>
      <span className={`${text} font-bold tracking-tight ${tone === 'light' ? 'text-white' : 'text-slate-900'}`}>
        my<span className={tone === 'light' ? 'text-brand-100' : 'text-brand-600'}>Care</span>Notes
      </span>
    </div>
  );
}
