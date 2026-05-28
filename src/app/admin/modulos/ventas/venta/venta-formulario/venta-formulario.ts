import { Component, computed, DestroyRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Popover } from 'primeng/popover';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellValueChangedEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  Theme,
} from 'ag-grid-community';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { myTheme } from '../../../../constantes/ag-grid-theme-builder';
import { ClienteFormulario } from '../../cliente/cliente-formulario/cliente-formulario';
import { ProductoCampos } from '../../../catalogo/producto/producto-campos/producto-campos';
import { VentaService } from '../venta.service';
import { ClienteService } from '../../cliente/cliente.service';
import { ProductoService } from '../../../catalogo/producto/producto.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { UtilService } from '../../../../service/util.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { FormsService } from '../../../../service/forms-service';
import { FormaPago, ItemVenta, Venta } from '../../../../entities/Venta';
import { CatProducto } from '../../../../entities/CatProducto';
import { VentaCliente } from '../../../../entities/VentaCliente';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-venta-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    ProductoCampos,
    Popover,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    FloatLabelModule,
    ButtonModule,
    AutoCompleteModule,
    DialogModule,
    TooltipModule,
    TextareaModule,
    AgGridAngular,
    ClienteFormulario,
  ],
  templateUrl: './venta-formulario.html',
})
export class VentaFormulario implements OnInit {

  @ViewChild(ClienteFormulario) private clienteFormRef?: ClienteFormulario;
  @ViewChild('clientePanel') private clientePanel!: Popover;

  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private utilService = inject(UtilService);
  private formsService = inject(FormsService) as FormsService<Venta>;
  private readonly destroyRef = inject(DestroyRef);
  public tabsState = inject(TabsStateService);

  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;
  public subtitulo = 'Nueva Venta';
  public clientes           = this.clienteService.listaClientes;
  public clientesActivos = computed(() => this.clientes().filter(c => c.estado));
  public clientesScrollHeight = computed(() => {
    const total = this.clientesActivos().length * 43;
    return `${Math.min(total + 8, 200)}px`;
  });

  public readonly filtroCliente = signal('');
  public readonly clientesFiltrados = computed(() => {
    const q = this.filtroCliente().toLowerCase().trim();
    const all = this.clientesActivos();
    if (!q) return all;
    return all.filter(c =>
      c.nombre.toLowerCase().includes(q) || c.identificacion.toLowerCase().includes(q)
    );
  });
  public productos          = this.productoService.listaProductos;

  public productoSeleccionado: CatProducto | null = null;
  public productosFiltrados = signal<CatProducto[]>([]);
  public readonly termino = signal('');
  public readonly mostrarCrearProducto = computed(
    () => this.termino().length > 2 && this.productosFiltrados().length === 0
  );
  public cantidad = 1;

  public dialogClienteVisible = signal(false);
  public dialogProductoVisible = signal(false);
  public dialogImprimirVisible = signal(false);
  public ventaRegistrada = signal<{ numero: string; total: number } | null>(null);

  private gridApi!: GridApi<ItemVenta>;
  public theme: Theme = myTheme;
  public localeText = AG_GRID_LOCALE_ES;
  public gridContext = { component: this };
  public itemCount = signal(0);
  public rowHeight = 44;

  public overlayNoRowsTemplate = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                color:#9ca3af;padding:3rem 0;gap:.5rem">
      <i class="pi pi-shopping-cart" style="font-size:2.5rem;opacity:.25"></i>
      <p style="font-weight:500;margin:0">El carrito está vacío</p>
      <p style="font-size:.8125rem;margin:0;opacity:.75">
        Escanea o escribe un producto abajo
      </p>
    </div>`;

  private _totales = signal({ subtotal: 0, iva: 0, total: 0 });
  private _ivaLineas = signal<{ label: string; valor: number }[]>([{ label: 'IVA', valor: 0 }]);
  private _descuentoTotal = signal(0);
  private _totalUnidades = signal(0);

  public subtotal      = computed(() => this._totales().subtotal);
  public iva           = computed(() => this._totales().iva);
  public total         = computed(() => this._totales().total);
  public ivaLineas     = this._ivaLineas.asReadonly();
  public descuentoTotal = computed(() => this._descuentoTotal());
  public totalUnidades  = computed(() => this._totalUnidades());

  public montoCobrar = signal(0);
  public cambio = computed(() => {
    const mc = this.montoCobrar();
    const t = this.total();
    return mc > 0 ? Math.max(0, mc - t) : 0;
  });

  public labelCobrar = computed(() => {
    const t = this.total();
    return `✓ Cobrar $${t.toFixed(2)}`;
  });

  public sugerenciasEfectivo = [300, 500, 1000];

  public formasPago: { label: string; sublabel: string; value: FormaPago; icon: string }[] = [
    { label: 'Efectivo',      sublabel: 'Calcula cambio',   value: 'EFECTIVO',      icon: 'pi pi-wallet' },
    { label: 'Tarjeta',       sublabel: 'Crédito o débito', value: 'TARJETA',       icon: 'pi pi-credit-card' },
    { label: 'Transferencia', sublabel: 'SPEI',              value: 'TRANSFERENCIA', icon: 'pi pi-send' },
    { label: 'Crédito',       sublabel: 'A 30 días',         value: 'CREDITO',       icon: 'pi pi-clock' },
    { label: 'Por pagar',     sublabel: '',                  value: 'POR_PAGAR',     icon: 'pi pi-calendar' },
  ];

  public ventaForm = this.fb.group({
    formaPago:   ['EFECTIVO' as FormaPago, [Validators.required]],
    observacion: [''],
    clienteId:   [null as string | null],
  });

  private _formaPago = toSignal(this.ventaForm.controls.formaPago.valueChanges, {
    initialValue: 'EFECTIVO' as FormaPago | null,
  });

  public formaPagoActual = computed(() => this._formaPago() ?? 'EFECTIVO');

  public readonly clienteSeleccionado = signal<VentaCliente | null>(null);

  seleccionarCliente(id: string | null): void {
    this.clienteSeleccionado.set(id ? (this.clientes().find(c => c.id === id) ?? null) : null);
  }

  private sincronizarClienteSeleccionado(): void {
    const id = this.ventaForm.controls.clienteId.value;
    this.clienteSeleccionado.set(id ? (this.clientes().find(c => c.id === id) ?? null) : null);
  }

  public productoRapidoForm = this.fb.group({
    codigo:         ['', [Validators.required]],
    nombre:         ['', [Validators.required]],
    precioVenta:    [0, [Validators.required, Validators.min(0.01)]],
    categoriaId:    [null as string | null, [Validators.required]],
    unidadMedidaId: [null as string | null, [Validators.required]],
    tarifaIvaId:    [null as string | null, [Validators.required]],
    stock:          [0],
    stockMinimo:    [0],
  });

  private readonly _avatarPalette = [
    { bg: '#d1fae5', color: '#065f46' },
    { bg: '#dbeafe', color: '#1e40af' },
    { bg: '#fef3c7', color: '#92400e' },
    { bg: '#ede9fe', color: '#5b21b6' },
    { bg: '#fee2e2', color: '#991b1b' },
    { bg: '#cffafe', color: '#164e63' },
    { bg: '#ffedd5', color: '#9a3412' },
  ];

  public defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
  };


  public columnDefs: ColDef<ItemVenta>[] = [
    {
      field: 'productoCodigo',
      headerName: 'CÓDIGO',
      width: 100,
      cellRenderer: (params: ICellRendererParams<ItemVenta>) => {
        const span = document.createElement('span');
        span.textContent = params.value;
        span.style.cssText =
          'font-family:monospace;font-size:11px;background:var(--ag-row-hover-color);color:var(--ag-secondary-foreground-color);padding:2px 7px;border-radius:4px;white-space:nowrap;';
        return span;
      },
    },
    {
      field: 'productoNombre',
      headerName: 'PRODUCTO',
      flex: 1,
      minWidth: 160,
      cellRenderer: (params: ICellRendererParams<ItemVenta>) => {
        const component = (params.context as { component: VentaFormulario }).component;
        const product = component.productos().find(p => p.id === params.data?.productoId);
        const name: string = params.data?.productoNombre ?? '';
        const initials = name
          .split(' ')
          .slice(0, 2)
          .map((w: string) => w.charAt(0))
          .join('')
          .toUpperCase();
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:8px;height:100%;';

        const palette = component._avatarPalette;
        const { bg, color } = palette[(name.charCodeAt(0) ?? 0) % palette.length];
        const avatar = document.createElement('div');
        avatar.textContent = initials.slice(0, 2);
        avatar.style.cssText = `width:28px;height:28px;border-radius:6px;background:${bg};color:${color};font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;`;

        const textWrap = document.createElement('div');
        textWrap.style.cssText = 'flex:1;min-width:0;';

        const nameEl = document.createElement('div');
        nameEl.textContent = params.value;
        nameEl.style.cssText =
          'font-size:12.5px;font-weight:500;color:var(--ag-foreground-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;';

        const stock = product?.stock ?? 0;
        const stockMinimo = (product as any)?.stockMinimo ?? 0;
        const isLowStock = stock > 0 && stockMinimo > 0 && stock <= stockMinimo * 2;
        const dotColor = stock === 0 ? '#ef4444' : isLowStock ? '#f59e0b' : '#22c55e';
        const stockLabel = stock === 0 ? 'Sin stock' : isLowStock ? `Quedan ${stock}` : `Stock: ${stock}`;
        const unitLabel = (product as any)?.unidadMedidaDescripcion ?? '';

        const subEl = document.createElement('div');
        subEl.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:10.5px;color:var(--ag-secondary-foreground-color);margin-top:1px;';
        const dot = document.createElement('span');
        dot.style.cssText = `width:5px;height:5px;border-radius:50%;background:${dotColor};flex-shrink:0;display:inline-block;`;
        const txt = document.createElement('span');
        txt.textContent = stockLabel + (unitLabel ? ` · ${unitLabel}` : '');
        subEl.appendChild(dot);
        subEl.appendChild(txt);

        textWrap.appendChild(nameEl);
        textWrap.appendChild(subEl);
        div.appendChild(avatar);
        div.appendChild(textWrap);
        return div;
      },
    },
    {
      field: 'cantidad',
      headerName: 'CANTIDAD',
      width: 130,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 1, precision: 0 },
      cellRenderer: (params: ICellRendererParams<ItemVenta>) => {
        const component = (params.context as { component: VentaFormulario }).component;

        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:4px;height:100%;';

        const btnStyle =
          'width:20px;height:20px;border:1px solid var(--ag-border-color);border-radius:4px;background:var(--ag-row-hover-color);cursor:pointer;color:var(--ag-secondary-foreground-color);display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;';

        const btnMinus = document.createElement('button');
        btnMinus.type = 'button';
        btnMinus.innerHTML = '<i class="pi pi-minus" style="font-size:7px"></i>';
        btnMinus.style.cssText = btnStyle;

        const numSpan = document.createElement('span');
        numSpan.textContent = String(params.value);
        numSpan.style.cssText = 'min-width:24px;text-align:center;font-size:12.5px;font-weight:500;color:var(--ag-foreground-color);';

        const btnPlus = document.createElement('button');
        btnPlus.type = 'button';
        btnPlus.innerHTML = '<i class="pi pi-plus" style="font-size:7px"></i>';
        btnPlus.style.cssText = btnStyle;

        btnMinus.addEventListener('click', (e) => {
          e.stopPropagation();
          component.decrementarCantidad(params.data!.productoId);
        });
        btnPlus.addEventListener('click', (e) => {
          e.stopPropagation();
          component.incrementarCantidad(params.data!.productoId);
        });

        div.appendChild(btnMinus);
        div.appendChild(numSpan);
        div.appendChild(btnPlus);
        return div;
      },
    },
    {
      field: 'precioUnitario',
      headerName: 'P. UNIT.',
      width: 100,
      type: 'rightAligned',
      valueFormatter: (p) => (p.value != null ? `$${(p.value as number).toFixed(2)}` : ''),
    },
    {
      field: 'descuento',
      headerName: 'DESCUENTO',
      width: 120,
      editable: true,
      type: 'rightAligned',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, precision: 2 },
      cellRenderer: (params: ICellRendererParams<ItemVenta>) => {
        const val = (params.value as number) ?? 0;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;height:100%;';

        const badge = document.createElement('span');
        if (val > 0) {
          badge.textContent = `-$${val.toFixed(2)}`;
          badge.style.cssText =
            'font-size:11px;background:color-mix(in srgb,#f59e0b 18%,var(--ag-background-color));color:#f59e0b;padding:2px 7px;border-radius:4px;font-weight:500;cursor:pointer;';
        } else {
          badge.innerHTML = '<i class="pi pi-tag" style="font-size:9px;margin-right:3px"></i>Descto.';
          badge.style.cssText =
            'font-size:11px;background:var(--ag-row-hover-color);color:var(--ag-secondary-foreground-color);padding:2px 8px;border-radius:4px;cursor:pointer;';
        }
        div.appendChild(badge);
        return div;
      },
    },
    {
      headerName: '',
      width: 46,
      resizable: false,
      cellRenderer: (params: ICellRendererParams<ItemVenta>) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = '<i class="pi pi-trash" style="font-size:11px"></i>';
        btn.style.cssText =
          'background:none;border:none;cursor:pointer;color:#ef4444;padding:0 6px;height:100%;display:flex;align-items:center;';
        btn.title = 'Eliminar';
        btn.onclick = (e) => {
          e.stopPropagation();
          (params.context as { component: VentaFormulario }).component.eliminarItem(params.data!.productoId);
        };
        return btn;
      },
    },
  ];

  public getRowId = (params: GetRowIdParams<ItemVenta>) => params.data.productoId;

  @HostListener('document:keydown.F2', ['$event'])
  onF2(event: Event): void {
    if (this.itemCount() > 0) {
      event.preventDefault();
      this.guardarVenta();
    }
  }

  ngOnInit(): void {
    if (this.accion() === AccionEnum.EDITAR) {
      const venta = this.formsService.objetoSeleccionado();
      if (venta) {
        this.subtitulo = 'Editando ' + (venta.numero ?? '');
        this.ventaForm.patchValue({
          formaPago:   venta.formaPago,
          observacion: venta.observacion ?? '',
          clienteId:   venta.clienteId ?? null,
        });
      }
    } else {
      setTimeout(() => {
        (document.getElementById('productoSearch') as HTMLInputElement)?.focus();
      }, 150);
    }

    this.ventaForm.controls.clienteId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.sincronizarClienteSeleccionado());

    if (this.clientes().length === 0) {
      this.clienteService.cargar()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.sincronizarClienteSeleccionado());
    } else {
      this.sincronizarClienteSeleccionado();
    }

    if (this.productos().length === 0) {
      this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  onGridReady(event: GridReadyEvent<ItemVenta>): void {
    this.gridApi = event.api;
    if (this.accion() === AccionEnum.EDITAR) {
      const venta = this.formsService.objetoSeleccionado();
      if (venta?.items?.length) {
        this.gridApi.setGridOption('rowData', [...venta.items]);
        this.sincronizarTotales();
        this.itemCount.set(venta.items.length);
      }
    }
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

  onProductoSelect(event: { value: CatProducto }): void {
    this.productoSeleccionado = event.value;
    this.termino.set('');
    setTimeout(() => this.agregarItem(), 0);
  }

  onSearchEnter(): void {
    if (this.esProductoValido()) {
      this.agregarItem();
      return;
    }
    const sugs = this.productosFiltrados();
    if (sugs.length > 0) {
      this.productoSeleccionado = sugs[0];
      setTimeout(() => this.agregarItem(), 0);
    }
  }

  esProductoValido(): boolean {
    return (
      this.productoSeleccionado !== null &&
      typeof this.productoSeleccionado === 'object' &&
      !!this.productoSeleccionado.id
    );
  }

  seleccionarFormaPago(value: FormaPago): void {
    this.ventaForm.controls.formaPago.setValue(value);
    this.montoCobrar.set(0);
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0))
      .join('')
      .toUpperCase();
  }

  limpiarCliente(): void {
    this.ventaForm.controls.clienteId.setValue(null);
    this.clienteSeleccionado.set(null);
  }

  seleccionarClienteDesdePanel(c: VentaCliente): void {
    this.ventaForm.controls.clienteId.setValue(c.id ?? null);
    this.clienteSeleccionado.set(c);
    this.filtroCliente.set('');
    this.clientePanel.hide();
  }

  limpiarClienteDesdePanel(): void {
    this.limpiarCliente();
    this.filtroCliente.set('');
    this.clientePanel.hide();
  }

  vaciarCarrito(): void {
    this.gridApi?.setGridOption('rowData', []);
    this.itemCount.set(0);
    this.sincronizarTotales();
  }

  abrirDescuentoGlobal(): void {
    this.toast.info('Descuento global — próximamente');
  }

  agregarItem(): void {
    if (!this.esProductoValido()) {
      this.toast.error('Seleccione un producto de la lista');
      return;
    }
    const producto = this.productoSeleccionado!;
    const existingNode = this.gridApi?.getRowNode(producto.id!);

    if (existingNode?.data) {
      const item = existingNode.data;
      this.gridApi.applyTransaction({ update: [{ ...item, cantidad: item.cantidad + this.cantidad }] });
    } else {
      const nuevoItem: ItemVenta = {
        productoId:     producto.id!,
        productoCodigo: producto.codigo,
        productoNombre: producto.nombre,
        cantidad:       this.cantidad,
        precioUnitario: producto.precioVenta,
        descuento:      0,
        subtotal:       producto.precioVenta * this.cantidad,
        porcentajeIva:  producto.porcentajeIva ?? 15,
        codigoSriIva:   undefined,
      };
      this.gridApi.applyTransaction({ add: [nuevoItem] });
    }

    this.sincronizarTotales();
    this.itemCount.set(this.gridApi.getDisplayedRowCount());
    this.productoSeleccionado = null;
    this.cantidad = 1;
  }

  eliminarItem(productoId: string): void {
    const node = this.gridApi.getRowNode(productoId);
    if (node?.data) {
      this.gridApi.applyTransaction({ remove: [node.data] });
      this.sincronizarTotales();
      this.itemCount.set(this.gridApi.getDisplayedRowCount());
    }
  }

  incrementarCantidad(productoId: string): void {
    const node = this.gridApi.getRowNode(productoId);
    if (node?.data) {
      this.gridApi.applyTransaction({ update: [{ ...node.data, cantidad: node.data.cantidad + 1 }] });
      this.sincronizarTotales();
    }
  }

  decrementarCantidad(productoId: string): void {
    const node = this.gridApi.getRowNode(productoId);
    if (!node?.data || node.data.cantidad <= 1) return;
    this.gridApi.applyTransaction({ update: [{ ...node.data, cantidad: node.data.cantidad - 1 }] });
    this.sincronizarTotales();
  }

  onCellValueChanged(event: CellValueChangedEvent<ItemVenta>): void {
    this.gridApi.refreshCells({ rowNodes: [event.node], columns: ['subtotalCalc'], force: true });
    this.sincronizarTotales();
  }

  // ─── Cliente (dialog) ─────────────────────────────────────────────────────

  abrirDialogCliente(): void {
    this.dialogClienteVisible.set(true);
    setTimeout(() => this.clienteFormRef?.initForm(), 0);
  }

  guardarClienteDesdeDialog(): void {
    this.clienteFormRef?.realizarAccion();
  }

  onClienteGuardado(data: VentaCliente): void {
    this.ventaForm.controls.clienteId.setValue(data.id ?? null);
    this.clienteSeleccionado.set(data);
    this.dialogClienteVisible.set(false);
  }

  // ─── Producto rápido ──────────────────────────────────────────────────────

  abrirDialogProducto(): void {
    this.productoRapidoForm.reset();
    this.productoRapidoForm.controls.precioVenta.setValue(0);
    this.productoRapidoForm.controls.stock.setValue(0);
    this.productoRapidoForm.controls.stockMinimo.setValue(0);
    this.dialogProductoVisible.set(true);
  }

  refrescarProductos(): void {
    this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.toast.info('Productos actualizados'),
    });
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
          this.productoSeleccionado = data;
          this.dialogProductoVisible.set(false);
          this.cargando.inactivar();
        },
      });
  }

  // ─── Guardado y reset ─────────────────────────────────────────────────────

  private sincronizarTotales(): void {
    let sub = 0;
    let iva = 0;
    let desc = 0;
    let uds = 0;
    const ivaMap = new Map<number, number>();

    this.gridApi.forEachNode((node) => {
      if (node.data) {
        const d = node.data;
        desc += d.descuento ?? 0;
        uds += d.cantidad;
        const itemSub = Math.max(0, d.cantidad * d.precioUnitario - (d.descuento ?? 0));
        sub += itemSub;
        const pct = d.porcentajeIva ?? 15;
        if (pct > 0) {
          const ivaItem = itemSub * pct / 100;
          iva += ivaItem;
          ivaMap.set(pct, (ivaMap.get(pct) ?? 0) + ivaItem);
        }
      }
    });

    this._descuentoTotal.set(desc);
    this._totalUnidades.set(uds);
    this._totales.set({ subtotal: sub, iva, total: sub + iva });

    const lineas = Array.from(ivaMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([pct, valor]) => ({ label: `IVA ${pct}%`, valor }));
    this._ivaLineas.set(lineas.length > 0 ? lineas : [{ label: 'IVA', valor: 0 }]);
  }

  private getItems(): ItemVenta[] {
    const items: ItemVenta[] = [];
    this.gridApi.forEachNode((node) => {
      if (node.data) {
        const d = node.data;
        items.push({ ...d, subtotal: Math.max(0, d.cantidad * d.precioUnitario - (d.descuento ?? 0)) });
      }
    });
    return items;
  }

  guardarVenta(): void {
    if (!this.utilService.validarFormulario(this.ventaForm)) return;
    const items = this.getItems();
    if (items.length === 0) {
      this.toast.error('Agregue al menos un producto');
      return;
    }

    this.cargando.activar();
    const formValue = this.ventaForm.getRawValue();

    const payload: Venta = {
      formaPago:   formValue.formaPago as FormaPago,
      observacion: formValue.observacion ?? undefined,
      clienteId:   formValue.clienteId ?? undefined,
      subtotal:    this.subtotal(),
      descuento:   this.descuentoTotal(),
      baseIva:     0,
      baseExenta:  0,
      iva:         this.iva(),
      total:       this.total(),
      items,
    };

    if (this.accion() === AccionEnum.EDITAR) {
      const ventaExistente = this.formsService.objetoSeleccionado();
      this.ventaService
        .actualizar({ ...payload, id: ventaExistente?.id })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.cargando.inactivar();
            this.ventaService.actualizarElGrid(data);
            this.toast.success('Venta ' + data.numero + ' actualizada correctamente');
            this.tabsState.irATab(TabsEnum.LISTADO);
          },
        });
    } else {
      this.ventaService
        .guardar(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.cargando.inactivar();
            this.ventaService.agregarAlGrid(data);
            this.ventaRegistrada.set({ numero: data.numero ?? '', total: this.total() });
            this.dialogImprimirVisible.set(true);
            this.resetFormulario();
          },
        });
    }
  }

  irAlListado(): void {
    this.dialogImprimirVisible.set(false);
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  imprimirVenta(): void {
    this.dialogImprimirVisible.set(false);
    window.print();
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  resetFormulario(): void {
    this.ventaForm.reset();
    this.ventaForm.controls.formaPago.setValue('EFECTIVO');
    this.gridApi?.setGridOption('rowData', []);
    this._totales.set({ subtotal: 0, iva: 0, total: 0 });
    this._ivaLineas.set([{ label: 'IVA', valor: 0 }]);
    this._descuentoTotal.set(0);
    this._totalUnidades.set(0);
    this.itemCount.set(0);
    this.montoCobrar.set(0);
    this.productoSeleccionado = null;
    this.cantidad = 1;
    setTimeout(() => (document.getElementById('productoSearch') as HTMLInputElement)?.focus(), 100);
  }
}
