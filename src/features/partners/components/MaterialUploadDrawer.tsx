'use client';

import { useRef, useState } from 'react';
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

import type { MaterialType } from '../types';

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
  onUpload: (formData: FormData) => Promise<boolean>;
}

export function MaterialUploadDrawer({ open, onClose, onUpload }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaterialType>('deck');
  const [tagsInput, setTagsInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El título es requerido';
    if (!file) errs.file = 'Debés seleccionar un archivo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpload = async () => {
    if (!validate()) return;
    setLoading(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append('file', file!);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('type', type);
    tags.forEach((tag) => formData.append('tags[]', tag));

    const ok = await onUpload(formData);
    if (ok) {
      toast.success(`"${title}" subido. Disponible para todos los partners.`);
      setTitle('');
      setDescription('');
      setType('deck');
      setTagsInput('');
      setFile(null);
      setErrors({});
      onClose();
    } else {
      toast.error('Error al subir el material');
    }

    setLoading(false);
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

          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.pptx,.xlsx,.docx,.jpg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.file;
                return next;
              });
            }}
          />

          {file ? (
            <div className="rounded-xl border border-border/60 p-4 flex items-center gap-3">
              <Icon name="FileText" size={22} className="text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-body2 font-medium truncate">{file.name}</p>
                <p className="text-caption text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-error"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-dashed border-border/60 p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-muted/20 transition-colors w-full"
            >
              <Icon name="Upload" size={28} className="text-muted-foreground" />
              <p className="text-body2 text-muted-foreground font-medium">Seleccionar archivo</p>
              <p className="text-caption text-muted-foreground">
                PDF, PPTX, XLSX, imágenes — máx. 50 MB
              </p>
            </button>
          )}

          {errors.file && <p className="text-caption text-error -mt-3">{errors.file}</p>}
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
