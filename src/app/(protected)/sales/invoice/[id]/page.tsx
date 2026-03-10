import { InvoiceView } from 'src/features/sales/views/InvoiceView';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Factura | CRM',
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;

  return <InvoiceView invoiceId={id} />;
}
