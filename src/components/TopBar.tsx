import type { ActiveTab, Locale } from '../types/converter';
import type { TranslationStrings } from '../utils/i18n';

interface TopBarProps {
  t: TranslationStrings;
  locale: Locale;
  activeTab: ActiveTab;
  historyCount: number;
  hasGallery: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleLocale: () => void;
}

export function TopBar({
  t,
  locale,
  activeTab,
  historyCount,
  hasGallery,
  onSelectTab,
  onToggleLocale,
}: TopBarProps) {
  const navItems: { id: ActiveTab; label: string; count?: number }[] = [
    { id: 'portal', label: t.navPortal },
    { id: 'gallery', label: t.navGallery, count: hasGallery ? undefined : undefined },
    { id: 'history', label: t.navHistory, count: historyCount > 0 ? historyCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand wordmark (single element, single line) */}
        <button
          type="button"
          onClick={() => onSelectTab('portal')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
        >
          {t.brandName}
        </button>

        {/* Zone 2: Clean single-line text navigation */}
        <nav aria-label="Main navigation" className="flex items-center gap-3.5 sm:gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative h-14 inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="font-mono text-[11px] sm:text-xs tabular-nums text-slate-400">
                    ({item.count})
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single action control */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleLocale}
            aria-label={locale === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {t.langSwitchLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
