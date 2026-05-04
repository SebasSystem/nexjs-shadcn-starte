'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Icon,
  Input,
  SelectField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui';
import { Textarea } from 'src/shared/components/ui';

import type { MaterialType, PortalMaterial } from '../types';

const TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'deck', label: 'Presentación' },
  { value: 'training', label: 'Capacitación' },
  { value: 'product_sheet', label: 'Ficha de Producto' },
  { value: 'guide', label: 'Guía' },
  { value: 'contract_template', label: 'Plantilla Contrato' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onUpload: (data: Omit<PortalMaterial, 'id' | 'downloadCount'>) => void;
}

export function MaterialUploadDrawer({ open, onClose, onUpload }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaterialType>('deck');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El título es requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpload = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onUpload({
      title,
      description,
      type,
      fileName: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      fileSize: '2.4 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Juan Díaz',
      tags,
    });

    toast.success(`"${title}" subido. Disponible para todos los partners.`);
    setLoading(false);

    setTitle('');
    setDescription('');
    setType('deck');
    setTagsInput('');
    setErrors({});
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col overflow-y-auto">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>Subir material</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Aviso */}
          <div className="flex items-start gap-2.5 rounded-xl border border-info/30 bg-info/5 px-3 py-2.5">
            <Icon name="Info" size={15} className="text-info shrink-0 mt-0.5" />
            <p className="text-caption text-info">
              Los archivos subidos estarán disponibles para todos los partners activos.
            </p>
          </div>

          <Input
            label="Título *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Presentación Comercial 2026"
            error={errors.title}
          />

          <Textarea
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del material..."
            rows={2}
          />

          <SelectField
            label="Tipo *"
            required
            options={TYPE_OPTIONS}
            value={type}
            onChange={(v) => setType(v as MaterialType)}
          />

          <Input
            label="Tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ventas, demo, Q2 2026"
            hint="Separados por coma"
          />

          {/* Zona de subida (solo visual) */}
          <div className="rounded-xl border border-dashed border-border/60 p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-muted/20 transition-colors">
            <Icon name="Upload" size={28} className="text-muted-foreground" />
            <p className="text-body2 text-muted-foreground font-medium">Arrastrá tu archivo aquí</p>
            <p className="text-caption text-muted-foreground">PDF, PPTX, XLSX — máx. 50 MB</p>
          </div>
        </div>

        <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Subiendo...' : 'Subir'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
