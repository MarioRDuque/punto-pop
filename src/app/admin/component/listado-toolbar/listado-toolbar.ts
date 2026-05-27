import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild } from '@angular/core';

export interface ToolbarTab {
  key: string;
  label: string;
  count: number;
}

@Component({
  selector: 'app-listado-toolbar',
  standalone: true,
  templateUrl: './listado-toolbar.html',
})
export class ListadoToolbar {
  @Input() placeholder = 'Buscar...';
  @Input() tabs: ToolbarTab[] = [];
  @Input() activeTab = 'todos';
  @Input() searchValue = '';
  @Input() showSearch = true;
  @Input() searchShortcut = '';
  @Output() tabChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

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
