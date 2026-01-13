import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-header-crud',
  imports: [ButtonModule, CommonModule, PanelModule],
  templateUrl: './header-crud.html',
  styleUrl: './header-crud.scss',
})
export class HeaderCrud {

}
