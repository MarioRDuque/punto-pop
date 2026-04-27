import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
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
import { HeaderTransaccion } from '../../../../component/header-transaccion/header-transaccion';
import { InputComponent } from '../../../../component/input/input.component';
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
import { VentaCliente, TipoIdentificacion } from '../../../../entities/VentaCliente';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-venta-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    HeaderTransaccion,
    InputComponent,
    ProductoCampos,
    SelectModule,
    InputNumberModule,
    FloatLabelModule,
    ButtonModule,
    AutoCompleteModule,
    DialogModule,
    TooltipModule,
    TextareaModule,
    AgGridAngular,
  ],
  templateUrl: './venta-formulario.html',
})
export class VentaFormulario implements OnInit {

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
  public clientes = this.clienteService.listaClientes;
  public productos = this.productoService.listaProductos;

  public productoSeleccionado: CatProducto | null = null;
  public productosFiltrados = signal<CatProducto[]>([]);
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

  public overlayNoRowsTemplate = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                color:#9ca3af;padding:3rem 0;gap:.5rem">
      <i class="pi pi-shopping-cart" style="font-size:2.5rem;opacity:.25"></i>
      <p style="font-weight:500;margin:0">El carrito está vacío</p>
      <p style="font-size:.8125rem;margin:0;opacity:.75">
        Busca un producto arriba y presiona <strong>Agregar</strong>
      </p>
    </div>`;

  private _totales = signal({ subtotal: 0, iva: 0, total: 0 });
  private _ivaLineas = signal<{ label: string; valor: number }[]>([{ label: 'IVA', valor: 0 }]);

  public subtotal  = computed(() => this._totales().subtotal);
  public iva       = computed(() => this._totales().iva);
  public total     = computed(() => this._totales().total);
  public ivaLineas = this._ivaLineas.asReadonly();

  public formasPago: { label: string; value: FormaPago }[] = [
    { label: 'Efectivo',      value: 'EFECTIVO' },
    { label: 'Tarjeta',       value: 'TARJETA' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Crédito',       value: 'CREDITO' },
    { label: 'Por pagar',     value: 'POR_PAGAR' },
  ];

  public tiposIdentificacion: { label: string; value: TipoIdentificacion }[] = [
    { label: 'Cédula',    value: 'CEDULA' },
    { label: 'RUC',       value: 'RUC' },
    { label: 'Pasaporte', value: 'PASAPORTE' },
  ];

  public ventaForm = this.fb.group({
    formaPago:   ['EFECTIVO' as FormaPago, [Validators.required]],
    observacion: [''],
    clienteId:   [null as string | null],
  });

  public clienteForm = this.fb.group({
    tipoIdentificacion: ['CEDULA' as TipoIdentificacion, [Validators.required]],
    identificacion:     ['', [Validators.required]],
    nombre:             ['', [Validators.required]],
    telefono:           [''],
    email:              [''],
  });

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

  public defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
  };

  public columnDefs: ColDef<ItemVenta>[] = [
    { field: 'productoCodigo', headerName: 'Código', width: 95 },
    { field: 'productoNombre', headerName: 'Producto', flex: 1, minWidth: 150 },
    {
      field: 'precioUnitario', headerName: 'P. Unit.', width: 105, type: 'rightAligned',
      valueFormatter: (p) => (p.value != null ? `$${(p.value as number).toFixed(2)}` : ''),
    },
    {
      field: 'cantidad', headerName: 'Cant.', width: 90, editable: true, type: 'rightAligned',
      cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0.001, precision: 3 },
    },
    {
      field: 'descuento', headerName: 'Descto.', width: 100, editable: true, type: 'rightAligned',
      cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, precision: 2 },
      valueFormatter: (p) => `$${((p.value as number) ?? 0).toFixed(2)}`,
    },
    {
      colId: 'subtotalCalc', headerName: 'Subtotal', width: 110, type: 'rightAligned',
      valueGetter: (p) => {
        const d = p.data;
        return d ? Math.max(0, d.cantidad * d.precioUnitario - (d.descuento ?? 0)) : 0;
      },
      valueFormatter: (p) => (p.value != null ? `$${(p.value as number).toFixed(2)}` : ''),
    },
    {
      headerName: '', width: 46, resizable: false,
      cellRenderer: (params: ICellRendererParams<ItemVenta>) => {
        const btn = document.createElement('button');
        btn.innerHTML = '<i class="pi pi-trash" style="font-size:11px"></i>';
        btn.style.cssText = 'background:none;border:none;cursor:pointer;color:#ef4444;padding:0 6px;height:100%;';
        btn.title = 'Eliminar';
        btn.onclick = () =>
          (params.context as { component: VentaFormulario }).component.eliminarItem(params.data!.productoId);
        return btn;
      },
    },
  ];

  public getRowId = (params: GetRowIdParams<ItemVenta>) => params.data.productoId;

  ngOnInit(): void {
    if (this.clientes().length === 0) {
      this.clienteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
    if (this.productos().length === 0) {
      this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
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
    this.productosFiltrados.set(
      this.productos()
        .filter((p) => p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q))
        .slice(0, 15)
    );
  }

  onProductoSelect(event: { value: CatProducto }): void {
    this.productoSeleccionado = event.value;
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

  onCellValueChanged(event: CellValueChangedEvent<ItemVenta>): void {
    this.gridApi.refreshCells({ rowNodes: [event.node], columns: ['subtotalCalc'], force: true });
    this.sincronizarTotales();
  }

  // ─── Cliente rápido ───────────────────────────────────────────────────────

  abrirDialogCliente(): void {
    this.clienteForm.reset();
    this.clienteForm.controls.tipoIdentificacion.setValue('CEDULA');
    this.dialogClienteVisible.set(true);
  }

  refrescarClientes(): void {
    this.clienteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.toast.info('Clientes actualizados'),
    });
  }

  guardarClienteRapido(): void {
    if (!this.utilService.validarFormulario(this.clienteForm)) return;
    this.cargando.activar();
    const v = this.clienteForm.getRawValue();
    const cliente: VentaCliente = {
      tipoIdentificacion: v.tipoIdentificacion as TipoIdentificacion,
      identificacion:     v.identificacion ?? '',
      nombre:             v.nombre ?? '',
      telefono:           v.telefono ?? undefined,
      email:              v.email ?? undefined,
      estado:             true,
    };
    this.clienteService.guardar(cliente)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Cliente "${data.nombre}" creado`);
          this.clienteService.agregarAlGrid(data);
          this.ventaForm.controls.clienteId.setValue(data.id ?? null);
          this.dialogClienteVisible.set(false);
          this.cargando.inactivar();
        },
      });
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
    const ivaMap = new Map<number, number>();

    this.gridApi.forEachNode((node) => {
      if (node.data) {
        const d = node.data;
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
      descuento:   0,
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
    this.itemCount.set(0);
    this.productoSeleccionado = null;
    this.cantidad = 1;
    setTimeout(() => (document.getElementById('productoSearch') as HTMLInputElement)?.focus(), 100);
  }
}
