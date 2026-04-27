import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Directive({
  selector: '[appHasPermiso]',
  standalone: true,
})
export class HasPermisoDirective implements OnInit {

  @Input('appHasPermiso') permiso!: string;

  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);

  ngOnInit(): void {
    if (this.auth.tienePermiso(this.permiso)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
