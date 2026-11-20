interface LogoProps {
  size?: 'sm' | 'md';
  tone?: 'dark' | 'light';
}

export default function Logo({ size = 'md', tone = 'dark' }: LogoProps) {
  const box = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const text = size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo-mark.png"
        alt=""
        width={44}
        height={44}
        className={`${box} rounded-[22%] ${tone === 'light' ? 'ring-2 ring-white/80 shadow-md' : 'shadow-sm'}`}
      />
      <span className={`${text} font-bold tracking-tight ${tone === 'light' ? 'text-white' : 'text-slate-900'}`}>
        myCareNotes
      </span>
    </div>
  );
}
