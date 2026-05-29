import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProductoCampos } from '../../../catalogo/producto/producto-campos/producto-campos';
import { CompraService } from '../compra.service';
import { ProveedorService } from '../../proveedor/proveedor.service';
import { ProductoService } from '../../../catalogo/producto/producto.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { UtilService } from '../../../../service/util.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Compra, DetalleCompra } from '../../../../entities/Compra';
import { CatProducto } from '../../../../entities/CatProducto';
import { Proveedor } from '../../../../entities/Proveedor';
import { TabsEnum } from '../../../../enums/tabs-enum';

const IVA_PORCENTAJE = 0.15;

export interface ItemCompra {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  unidadMedidaNombre?: string;
  stock?: number;
  cantidad: number;
  costoUnitario: number;
  descuentoPct: number;
}

export type CondicionPago = 'CONTADO' | 'TRANSFERENCIA' | 'CREDITO_30' | 'CREDITO_60';

@Component({
  selector: 'app-compra-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    AutoCompleteModule,
    TooltipModule,
    DialogModule,
    ProductoCampos,
  ],
  templateUrl: './compra-formulario.html',
})
export class CompraFormulario implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly compraService = inject(CompraService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly productoService = inject(ProductoService);
  private readonly toast = inject(ToastService);
  readonly cargando = inject(CargandoService);
  private readonly utilService = inject(UtilService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly tabsState = inject(TabsStateService);

  public readonly proveedores = this.proveedorService.listaProveedores;
  public readonly productos = this.productoService.listaProductos;

  // Scanner
  public productoScanner: CatProducto | null = null;
  public productosFiltrados = signal<CatProducto[]>([]);
  public readonly cantidadScanner = signal(1);
  public readonly costoScanner = signal(0);
  public readonly termino = signal('');
  public readonly mostrarCrearProducto = computed(
    () => this.termino().length > 2 && this.productosFiltrados().length === 0
  );

  // Dialog crear producto
  public readonly dialogProductoVisible = signal(false);
  public readonly productoRapidoForm = this.fb.group({
    codigo:         ['', [Validators.required]],
    nombre:         ['', [Validators.required]],
    precioVenta:    [0, [Validators.required, Validators.min(0.01)]],
    categoriaId:    [null as string | null, [Validators.required]],
    unidadMedidaId: [null as string | null, [Validators.required]],
    tarifaIvaId:    [null as string | null, [Validators.required]],
    stock:          [0],
    stockMinimo:    [0],
  });

  // Items
  private readonly _items = signal<ItemCompra[]>([]);
  public readonly items = this._items.asReadonly();
  public readonly itemCount = computed(() => this._items().reduce((s, i) => s + i.cantidad, 0));

  // Condicion de pago
  public readonly condicionPago = signal<CondicionPago>('CONTADO');
  public readonly plazo = signal<number>(30);
  public readonly fechaFacturaDate = signal<Date>(new Date());

  // Computed totals
  public readonly subtotalItems = computed(() =>
    this._items().reduce((s, i) => s + i.cantidad * i.costoUnitario * (1 - i.descuentoPct / 100), 0)
  );
  public readonly descuentoTotal = computed(() =>
    this._items().reduce((s, i) => s + i.cantidad * i.costoUnitario * (i.descuentoPct / 100), 0)
  );
  public readonly ivaTotal = computed(() => this.subtotalItems() * IVA_PORCENTAJE);
  public readonly totalFinal = computed(() => this.subtotalItems() + this.ivaTotal());

  public readonly fechaVencimiento = computed(() => {
    const d = new Date(this.fechaFacturaDate());
    d.setDate(d.getDate() + this.plazo());
    return d;
  });

  public readonly productosStockBajo = computed(() =>
    this.productos().filter((p) => p.stock <= p.stockMinimo && p.estado)
  );

  public compraForm = this.fb.group({
    proveedorId: [null as string | null, [Validators.required]],
    folioFactura: [''],
    observacion: [''],
  });

  readonly condiciones: Array<{ value: CondicionPago; label: string; subtitle: string; icon: string }> = [
    { value: 'CONTADO', label: 'Contado', subtitle: 'Pago inmediato', icon: 'pi pi-check' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', subtitle: 'SPEI', icon: 'pi pi-send' },
    { value: 'CREDITO_30', label: 'Crédito 30d', subtitle: 'Línea proveedor', icon: 'pi pi-clock' },
    { value: 'CREDITO_60', label: 'Crédito 60d', subtitle: 'Plazo extendido', icon: 'pi pi-calendar' },
  ];

  readonly plazos = [15, 30, 60, 90];

  ngOnInit(): void {
    if (this.proveedores().length === 0) {
      this.proveedorService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
    if (this.productos().length === 0) {
      this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  getProveedorSeleccionado(): Proveedor | null {
    const id = this.compraForm.get('proveedorId')?.value;
    return id ? (this.proveedores().find((p) => p.ruc === id) ?? null) : null;
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  limpiarProveedor(): void {
    this.compraForm.patchValue({ proveedorId: null });
  }

  filtrarProductos(event: { query: string }): void {
    const q = event.query.toLowerCase().trim();
    this.termino.set(event.query.trim());
    this.productosFiltrados.set(
      this.productos()
        .filter((p) => p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q))
        .slice(0, 15)
    );
  }

  onProductoScannerSelect(event: { value: CatProducto }): void {
    this.productoScanner = event.value;
    this.costoScanner.set(event.value.costo ?? 0);
    this.termino.set('');
    setTimeout(() => this.agregarItem(), 0);
  }

  abrirDialogProducto(): void {
    this.productoRapidoForm.reset();
    this.productoRapidoForm.controls.precioVenta.setValue(0);
    this.productoRapidoForm.controls.stock.setValue(0);
    this.productoRapidoForm.controls.stockMinimo.setValue(0);
    this.dialogProductoVisible.set(true);
  }

  guardarProductoRapido(): void {
    if (!this.utilService.validarFormulario(this.productoRapidoForm)) return;
    this.cargando.activar();
    const v = this.productoRapidoForm.getRawValue();
    const producto: CatProducto = {
      codigo:         v.codigo ?? '',
      nombre:         v.nombre ?? '',
      precioVenta:    v.precioVenta ?? 0,
      categoriaId:    v.categoriaId ?? '',
      unidadMedidaId: v.unidadMedidaId ?? '',
      tarifaIvaId:    v.tarifaIvaId ?? '',
      stock:          v.stock ?? 0,
      stockMinimo:    v.stockMinimo ?? 0,
      estado:         true,
    };
    this.productoService.guardar(producto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Producto "${data.nombre}" creado`);
          this.productoService.agregarAlGrid(data);
          this.productoScanner = data;
          this.costoScanner.set(data.costo ?? 0);
          this.dialogProductoVisible.set(false);
          this.cargando.inactivar();
          setTimeout(() => this.agregarItem(), 0);
        },
      });
  }

  esScannerValido(): boolean {
    return this.productoScanner !== null &&
      typeof this.productoScanner === 'object' &&
      !!(this.productoScanner as CatProducto).codigo;
  }

  agregarItem(): void {
    if (!this.esScannerValido()) {
      this.toast.error('Seleccione un producto de la lista');
      return;
    }
    const producto = this.productoScanner!;
    this._items.update((items) => {
      const idx = items.findIndex((i) => i.productoId === producto.codigo);
      if (idx >= 0) {
        const updated = [...items];
        updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + this.cantidadScanner() };
        return updated;
      }
      return [...items, {
        productoId: producto.codigo,
        productoCodigo: producto.codigo,
        productoNombre: producto.nombre,
        unidadMedidaNombre: producto.unidadMedidaNombre,
        stock: producto.stock,
        cantidad: this.cantidadScanner(),
        costoUnitario: this.costoScanner(),
        descuentoPct: 0,
      }];
    });
    this.productoScanner = null;
    this.cantidadScanner.set(1);
    this.costoScanner.set(0);
  }

  cambiarCantidad(productoId: string, delta: number): void {
    this._items.update((items) =>
      items.map((i) => i.productoId === productoId
        ? { ...i, cantidad: Math.max(1, i.cantidad + delta) }
        : i
      )
    );
  }

  eliminarItem(productoId: string): void {
    this._items.update((items) => items.filter((i) => i.productoId !== productoId));
  }

  actualizarCosto(productoId: string, costo: number): void {
    this._items.update((items) =>
      items.map((i) => i.productoId === productoId ? { ...i, costoUnitario: Math.max(0, costo) } : i)
    );
  }

  actualizarDescuento(productoId: string, descuento: number): void {
    this._items.update((items) =>
      items.map((i) => i.productoId === productoId ? { ...i, descuentoPct: Math.min(100, Math.max(0, descuento)) } : i)
    );
  }

  vaciarCarrito(): void {
    this._items.set([]);
  }

  seleccionarCondicion(condicion: CondicionPago): void {
    this.condicionPago.set(condicion);
    if (condicion === 'CREDITO_30') this.plazo.set(30);
    if (condicion === 'CREDITO_60') this.plazo.set(60);
  }

  esCredito(): boolean {
    return this.condicionPago() === 'CREDITO_30' || this.condicionPago() === 'CREDITO_60';
  }

  incrementarCantidadScanner(): void {
    this.cantidadScanner.update((v) => v + 1);
  }

  decrementarCantidadScanner(): void {
    this.cantidadScanner.update((v) => Math.max(1, v - 1));
  }

  formatFecha(date: Date): string {
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  diasHasta(date: Date): number {
    return Math.round((date.getTime() - Date.now()) / 86400000);
  }

  public irAlListado(): void {
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  public guardarCompra(): void {
    if (!this.compraForm.get('proveedorId')?.value) {
      this.toast.error('Seleccione un proveedor');
      return;
    }
    if (this._items().length === 0) {
      this.toast.error('Agregue al menos un producto');
      return;
    }

    this.cargando.activar();
    const detalles: DetalleCompra[] = this._items().map((i) => ({
      productoId: i.productoId,
      productoCodigo: i.productoCodigo,
      productoNombre: i.productoNombre,
      cantidad: i.cantidad,
      costoUnitario: i.costoUnitario,
      subtotal: i.cantidad * i.costoUnitario * (1 - i.descuentoPct / 100),
    }));

    const formValue = this.compraForm.getRawValue();
    const compra: Compra = {
      proveedorId: formValue.proveedorId!,
      observacion: formValue.observacion ?? undefined,
      subtotal: this.subtotalItems(),
      iva: this.ivaTotal(),
      total: this.totalFinal(),
      detalles,
    };

    this.compraService.guardar(compra)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Compra ${data.numero} creada en BORRADOR. Revise y presione Recibir.`);
          this.compraService.agregarAlGrid(data);
          this.cargando.inactivar();
          this.resetFormulario();
          this.tabsState.irATab(TabsEnum.LISTADO);
        },
      });
  }

  public resetFormulario(): void {
    this.compraForm.reset();
    this._items.set([]);
    this.condicionPago.set('CONTADO');
    this.plazo.set(30);
    this.fechaFacturaDate.set(new Date());
    this.productoScanner = null;
    this.cantidadScanner.set(1);
    this.costoScanner.set(0);
  }
}
