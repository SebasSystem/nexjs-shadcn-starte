import { ProjectDetailView } from 'src/features/projects/views/ProjectDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
