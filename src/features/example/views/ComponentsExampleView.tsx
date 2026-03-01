'use client';

import {
  Button,
  Input,
  Textarea,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SelectField,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Checkbox,
  Skeleton,
  RadioGroup,
  RadioGroupItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Progress,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Slider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Alert,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Label,
} from 'src/shared/components/ui';
import { Icon } from 'src/shared/components/ui';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  TableNoData,
  TableSelectedAction,
} from 'src/shared/components/table';
import { flexRender, type ColumnDef } from '@tanstack/react-table';

type UserData = {
  id: string;
  name: string;
  status: string;
  role: string;
};

const dummyData: UserData[] = [
  { id: '1', name: 'Ana García', status: 'Activo', role: 'Admin' },
  { id: '2', name: 'Carlos Mendoza', status: 'Pendiente', role: 'Editor' },
  { id: '3', name: 'Luis Torres', status: 'Inactivo', role: 'Lector' },
  { id: '4', name: 'Sofia Ruiz', status: 'Activo', role: 'UX Designer' },
  { id: '5', name: 'Miguel Silva', status: 'Activo', role: 'Desarrollador' },
];

export function ComponentsExampleView() {
  const columns: ColumnDef<UserData>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Nombre' },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status');
        const badgeVariant =
          status === 'Activo' ? 'success' : status === 'Pendiente' ? 'warning' : 'error';
        return (
          <Badge variant="soft" className={`border-${badgeVariant} text-${badgeVariant}`}>
            {String(status)}
          </Badge>
        );
      },
    },
    { accessorKey: 'role', header: 'Rol' },
  ];

  const { table, dense, onChangeDense } = useTable({
    data: dummyData,
    columns,
    defaultRowsPerPage: 5,
  });

  return (
    <div className="container mx-auto py-12 px-4 space-y-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Design System - Corporate Indigo</h1>
        <p className="text-muted-foreground text-lg">
          Vista temporal para visualizar y validar todos los componentes base del sistema.
        </p>
      </div>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">1. Buttons</h2>
          <p className="text-sm text-muted-foreground">Variantes principales y tamaños.</p>
        </div>
        <div className="flex flex-col gap-6 overflow-x-auto">
          {(['default', 'outline', 'soft', 'ghost', 'link'] as const).map((variant) => (
            <div key={variant} className="space-y-3">
              <h3 className="text-sm font-medium capitalize border-b pb-1 pr-4 inline-block">
                {variant} Variant
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                {(
                  [
                    'default',
                    'inherit',
                    'primary',
                    'secondary',
                    'success',
                    'warning',
                    'error',
                    'info',
                  ] as const
                ).map((color) => (
                  <Button key={color} variant={variant} color={color}>
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1 pt-4 border-t">
          <h3 className="text-sm font-medium">Tamaños y Estados</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Icon name="Mail" className="w-4 h-4" />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">2. Inputs</h2>
          <p className="text-sm text-muted-foreground">Estados de validación, tamaños y íconos.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Normal Input"
            placeholder="john@example.com"
            hint="We'll never share your email."
          />
          <Input
            label="With Left Icon"
            leftIcon={<Icon name="Mail" className="w-4 h-4" />}
            placeholder="john@example.com"
          />
          <Input
            label="With Right Icon"
            rightIcon={<Icon name="ShieldCheck" className="w-4 h-4 text-muted-foreground" />}
            placeholder="Security code"
          />
          <Input label="Success State" success placeholder="Correct value" />
          <Input label="Error State" error="This field is required" placeholder="Invalid value" />
          <Input label="Disabled State" disabled placeholder="You cannot edit this" />
          <Input label="Floating Label (Default)" floatingLabel placeholder="Will be hidden" />
          <Input
            label="Floating Label (Large)"
            floatingLabel
            size="lg"
            placeholder="Will be hidden"
          />
          <Input
            label="Floating Label (With Icon)"
            leftIcon={<Icon name="Mail" className="w-5 h-5 text-muted-foreground" />}
            floatingLabel
            size="lg"
            placeholder="Will be hidden"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">3. Tareas & Textareas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Standard Textarea</label>
            <Textarea placeholder="Escribe tu mensaje aquí..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Textarea con Error</label>
            <Textarea
              placeholder="Escribe tu mensaje aquí..."
              aria-invalid="true"
              className="aria-invalid:border-destructive"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">4. Select Field (Combobox)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField
            label="Single Select"
            placeholder="Selecciona una opción"
            options={[
              { label: 'Opción 1', value: '1' },
              { label: 'Opción 2', value: '2' },
              { label: 'Opción 3', value: '3' },
            ]}
          />
          <SelectField
            label="With Search"
            searchable
            placeholder="Busca un rol..."
            options={[
              { label: 'Administrador', value: 'admin' },
              { label: 'Supervisor', value: 'supervisor' },
              { label: 'Agente', value: 'agent' },
            ]}
          />
          <SelectField
            label="Error State"
            error="Debes seleccionar una opción"
            options={[{ label: 'Opción 1', value: '1' }]}
          />
          <SelectField
            label="Multiple Select"
            placeholder="Selecciona varios..."
            multiple
            clearable
            searchable
            options={[
              { label: 'React', value: 'react' },
              { label: 'Next.js', value: 'next' },
              { label: 'Tailwind', value: 'tailwind' },
              { label: 'TypeScript', value: 'typescript' },
            ]}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">5. Badges</h2>
        </div>
        <div className="flex flex-col gap-6 overflow-x-auto">
          {(['default', 'outline', 'soft', 'ghost'] as const).map((variant) => (
            <div key={variant} className="space-y-3">
              <h3 className="text-sm font-medium capitalize border-b pb-1 pr-4 inline-block">
                {variant} Variant
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                {(
                  [
                    'default',
                    'inherit',
                    'primary',
                    'secondary',
                    'success',
                    'warning',
                    'error',
                    'info',
                  ] as const
                ).map((color) => (
                  <Badge key={color} variant={variant} color={color}>
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">6. Cards</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Cuenta</CardTitle>
              <CardDescription>Métricas de los últimos 30 días.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contenido principal de la tarjeta. Ideal para gráficos o tablas de resumen.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button size="sm">Ver Detalles</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">7. Toggle Inputs (Switch & Checkbox)</h2>
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <label
              htmlFor="airplane-mode"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Airplane Mode
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">8. Accordion</h2>
          <p className="text-sm text-muted-foreground">
            Paneles colapsables para ocultar o mostrar contenido.
          </p>
        </div>
        <div className="max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Es este Design System accesible?</AccordionTrigger>
              <AccordionContent>
                Sí. Sigue las mejores prácticas y usa los primitivos de Radix UI para asegurar que
                todo sea usable con teclado y lectores de pantalla.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Puedo personalizar los colores?</AccordionTrigger>
              <AccordionContent>
                Por supuesto. Todo está construido sobre Tailwind y variables CSS, facilitando
                cualquier cambio temático sin problemas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>¿Cómo funciona la animación?</AccordionTrigger>
              <AccordionContent>
                Las animaciones se manejan mediante utilidades de Tailwind en los estados
                `data-[state=open]` y `data-[state=closed]`.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">9. Table</h2>
          <p className="text-sm text-muted-foreground">
            Tabla de datos básica con soporte completo.
          </p>
        </div>
        <Card className="max-w-4xl shadow-md border-0 ring-1 ring-border/50">
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>Gestiona, visualiza y filtra todos los usuarios.</CardDescription>
          </CardHeader>

          <CardContent className="p-0 relative overflow-x-auto">
            <TableSelectedAction
              numSelected={table.getSelectedRowModel().rows.length}
              rowCount={table.getCoreRowModel().rows.length}
              onSelectAllRows={(checked) => table.toggleAllRowsSelected(checked)}
            />
            <Table>
              <TableHeadCustom table={table} />
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={dense ? 'py-2 px-4 border-dashed' : 'py-4 px-4 border-dashed'}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableNoData notFound={true} colSpan={columns.length} />
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t border-dashed">
            <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">10. Otros Componentes</h2>
          <p className="text-sm text-muted-foreground">Skeleton, Dialogs, Popovers, Tabs, etc.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center flex-col gap-4 items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Estás completamente seguro?</DialogTitle>
                    <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button color="error">Eliminar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popover & Tooltip</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center flex-col gap-4 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="soft">Toggle Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 space-y-2">
                  <h4 className="font-medium leading-none">Dimensiones</h4>
                  <p className="text-sm text-muted-foreground">Ajusta dimensiones.</p>
                </PopoverContent>
              </Popover>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">Hover Me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Agregar a la librería</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radio, Switch, Slider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="r1" />
                  <Label htmlFor="r1">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="r2" />
                  <Label htmlFor="r2">Comfortable</Label>
                </div>
              </RadioGroup>
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>
              <Slider defaultValue={[33]} max={100} step={1} className="w-full pt-4" />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tabs, Progress, Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="account">Cuenta</TabsTrigger>
                  <TabsTrigger value="password">Contraseña</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="pt-4">
                  <p className="text-sm text-muted-foreground">Ajusta la configuración aquí.</p>
                </TabsContent>
                <TabsContent value="password" className="pt-4">
                  <p className="text-sm text-muted-foreground">Cambia tu contraseña aquí.</p>
                </TabsContent>
              </Tabs>
              <div className="space-y-2 pt-4">
                <Label>Subiendo archivo...</Label>
                <Progress value={66} className="h-2" />
              </div>
              <Alert variant="default" className="mt-6">
                <Icon name="Info" className="h-4 w-4" />
                <AlertTitle>Información</AlertTitle>
                <AlertDescription>
                  Nuevos componentes agregados satisfactoriamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
