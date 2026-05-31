import {
  Component, ElementRef, HostListener, Input, Output, EventEmitter,
  ViewChild, signal, AfterViewInit, OnDestroy, inject, NgZone,
} from '@angular/core';

export interface ToolbarTab {
  key: string;
  label: string;
  count: number;
}

interface OverflowItem {
  key: string;
  label: string;
  command: () => void;
}

@Component({
  selector: 'app-listado-toolbar',
  standalone: true,
  templateUrl: './listado-toolbar.html',
  styleUrl: './listado-toolbar.scss',
})
export class ListadoToolbar implements AfterViewInit, OnDestroy {
  @Input() placeholder = 'Buscar...';
  @Input() tabs: ToolbarTab[] = [];
  @Input() activeTab = 'todos';
  @Input() searchValue = '';
  @Input() showSearch = true;
  @Input() searchShortcut = '/';
  @Output() tabChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('tabsContainer', { read: ElementRef })
  tabsContainer!: ElementRef<HTMLDivElement>;

  private ngZone = inject(NgZone);
  private resizeObserver: ResizeObserver | null = null;

  showMore = signal(false);
  moreOpen = signal(false);
  overflowItems = signal<OverflowItem[]>([]);

  ngAfterViewInit() {
    this.initResizeObserver();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private initResizeObserver() {
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.checkOverflow());
      this.resizeObserver.observe(this.tabsContainer.nativeElement);
    });
  }

  private checkOverflow() {
    const el = this.tabsContainer.nativeElement;
    const hasOverflow = el.scrollWidth > el.clientWidth;

    if (hasOverflow) {
      const children = Array.from(el.children) as HTMLElement[];
      const gap = 6;
      const moreW = this.showMore() ? 0 : 36;
      const available = el.clientWidth - moreW - gap;
      let used = 0;
      let split = children.length;

      for (let i = 0; i < children.length; i++) {
        const w = children[i].offsetWidth + gap;
        if (used + w <= available) {
          used += w;
        } else {
          split = i;
          break;
        }
      }

      const overflow = this.tabs.slice(split);
      this.ngZone.run(() => {
        this.showMore.set(true);
        this.overflowItems.set(
          overflow.map((t) => ({
            key: t.key,
            label: `${t.label} (${t.count})`,
            command: () => {
              this.moreOpen.set(false);
              this.tabChange.emit(t.key);
            },
          }))
        );
      });
    } else {
      this.ngZone.run(() => {
        this.showMore.set(false);
        this.moreOpen.set(false);
        this.overflowItems.set([]);
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.searchShortcut || !this.showSearch) return;
    const target = e.target as HTMLElement;
    const inEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      || target.isContentEditable;
    if (e.key === this.searchShortcut && !inEditable) {
      e.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
    if (e.key === 'Escape' && target === this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.blur();
    }
  }
}
