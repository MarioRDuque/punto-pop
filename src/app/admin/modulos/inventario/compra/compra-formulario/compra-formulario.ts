import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
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
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { InputComponent } from '../../../../component/input/input.component';
import { CompraService } from '../compra.service';
import { ProveedorService } from '../../proveedor/proveedor.service';
import { ProductoService } from '../../../catalogo/producto/producto.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { UtilService } from '../../../../service/util.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Compra, DetalleCompra } from '../../../../entities/Compra';
import { CatProducto } from '../../../../entities/CatProducto';
import { TabsEnum } from '../../../../enums/tabs-enum';

const IVA_PORCENTAJE = 0.15;

@Component({
  selector: 'app-compra-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    HeaderCrud,
    InputComponent,
    SelectModule,
    InputNumberModule,
    FloatLabelModule,
    ButtonModule,
    AutoCompleteModule,
    AgGridAngular,
  ],
  templateUrl: './compra-formulario.html',
})
export class CompraFormulario implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly compraService = inject(CompraService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly productoService = inject(ProductoService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly utilService = inject(UtilService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly tabsState = inject(TabsStateService);

  public readonly subtitulo = 'Nueva Orden de Compra';
  public readonly proveedores = this.proveedorService.listaProveedores;
  public readonly productos = this.productoService.listaProductos;

  public productoSeleccionado: CatProducto | null = null;
  public productosFiltrados = signal<CatProducto[]>([]);
  public cantidad = 1;
  public costoUnitario = 0;

  private gridApi!: GridApi<DetalleCompra>;
  public theme: Theme = myTheme;
  public localeText = AG_GRID_LOCALE_ES;
  public gridContext = { component: this };

  private _totales = signal({ subtotal: 0, iva: 0, total: 0 });
  public subtotal = computed(() => this._totales().subtotal);
  public iva = computed(() => this._totales().iva);
  public total = computed(() => this._totales().total);

  public compraForm = this.fb.group({
    proveedorId: [null as string | null, [Validators.required]],
    observacion: [''],
  });

  public defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
  };

  public columnDefs: ColDef<DetalleCompra>[] = [
    { field: 'productoCodigo',  headerName: 'Código',     width: 95 },
    { field: 'productoNombre',  headerName: 'Producto',   flex: 1, minWidth: 150 },
    {
      field: 'cantidad', headerName: 'Cant.', width: 90,
      editable: true, type: 'rightAligned',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0.001, precision: 3 },
    },
    {
      field: 'costoUnitario', headerName: 'Costo Unit.', width: 120,
      editable: true, type: 'rightAligned',
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0.0001, precision: 4 },
      valueFormatter: (p) => p.value != null ? `$${(p.value as number).toFixed(4)}` : '',
    },
    {
      colId: 'subtotalCalc', headerName: 'Subtotal', width: 110,
      type: 'rightAligned',
      valueGetter: (p) => {
        const d = p.data;
        return d ? d.cantidad * d.costoUnitario : 0;
      },
      valueFormatter: (p) => p.value != null ? `$${(p.value as number).toFixed(2)}` : '',
    },
    {
      headerName: '', width: 46, resizable: false,
      cellRenderer: (params: ICellRendererParams<DetalleCompra>) => {
        const btn = document.createElement('button');
        btn.innerHTML = '<i class="pi pi-trash" style="font-size:11px"></i>';
        btn.style.cssText =
          'background:none;border:none;cursor:pointer;color:#ef4444;padding:0 6px;height:100%;';
        btn.title = 'Eliminar';
        btn.onclick = () =>
          (params.context as { component: CompraFormulario }).component.eliminarItem(
            params.data!.productoId
          );
        return btn;
      },
    },
  ];

  public getRowId = (params: GetRowIdParams<DetalleCompra>) => params.data.productoId;

  ngOnInit(): void {
    if (this.proveedores().length === 0) {
      this.proveedorService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
    if (this.productos().length === 0) {
      this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  onGridReady(event: GridReadyEvent<DetalleCompra>): void {
    this.gridApi = event.api;
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
    this.costoUnitario = event.value.costo ?? 0;
  }

  esProductoValido(): boolean {
    return (
      this.productoSeleccionado !== null &&
      typeof this.productoSeleccionado === 'object' &&
      !!this.productoSeleccionado.id
    );
  }

  agregarItem(): void {
    if (!this.esProductoValido()) {
      this.toast.error('Seleccione un producto de la lista');
      return;
    }
    if (this.costoUnitario <= 0) {
      this.toast.error('Ingrese un costo unitario mayor a cero');
      return;
    }
    const producto = this.productoSeleccionado!;
    const existingNode = this.gridApi?.getRowNode(producto.id!);

    if (existingNode?.data) {
      const item = existingNode.data;
      this.gridApi.applyTransaction({
        update: [{ ...item, cantidad: item.cantidad + this.cantidad }],
      });
    } else {
      const nuevoDetalle: DetalleCompra = {
        productoId:    producto.id!,
        productoCodigo: producto.codigo,
        productoNombre: producto.nombre,
        cantidad:       this.cantidad,
        costoUnitario:  this.costoUnitario,
        subtotal:       this.cantidad * this.costoUnitario,
      };
      this.gridApi.applyTransaction({ add: [nuevoDetalle] });
    }

    this.sincronizarTotales();
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.costoUnitario = 0;
  }

  eliminarItem(productoId: string): void {
    const node = this.gridApi.getRowNode(productoId);
    if (node?.data) {
      this.gridApi.applyTransaction({ remove: [node.data] });
      this.sincronizarTotales();
    }
  }

  onCellValueChanged(event: CellValueChangedEvent<DetalleCompra>): void {
    this.gridApi.refreshCells({
      rowNodes: [event.node],
      columns: ['subtotalCalc'],
      force: true,
    });
    this.sincronizarTotales();
  }

  private sincronizarTotales(): void {
    let sub = 0;
    this.gridApi.forEachNode((node) => {
      if (node.data) sub += node.data.cantidad * node.data.costoUnitario;
    });
    const iva = sub * IVA_PORCENTAJE;
    this._totales.set({ subtotal: sub, iva, total: sub + iva });
  }

  private getDetalles(): DetalleCompra[] {
    const items: DetalleCompra[] = [];
    this.gridApi.forEachNode((node) => {
      if (node.data) {
        const d = node.data;
        items.push({ ...d, subtotal: d.cantidad * d.costoUnitario });
      }
    });
    return items;
  }

  guardarCompra(): void {
    if (!this.utilService.validarFormulario(this.compraForm)) return;
    const detalles = this.getDetalles();
    if (detalles.length === 0) {
      this.toast.error('Agregue al menos un producto');
      return;
    }

    this.cargando.activar();
    const formValue = this.compraForm.getRawValue();
    const compra: Compra = {
      proveedorId: formValue.proveedorId!,
      observacion: formValue.observacion ?? undefined,
      subtotal: this.subtotal(),
      iva:      this.iva(),
      total:    this.total(),
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

  resetFormulario(): void {
    this.compraForm.reset();
    this.gridApi?.setGridOption('rowData', []);
    this._totales.set({ subtotal: 0, iva: 0, total: 0 });
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.costoUnitario = 0;
  }
}
