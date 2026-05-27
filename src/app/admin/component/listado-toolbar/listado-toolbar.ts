import { Component, Input, Output, EventEmitter } from '@angular/core';

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
}
