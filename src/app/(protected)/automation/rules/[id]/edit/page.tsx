import { RuleBuilderView } from 'src/features/automation/views/RuleBuilderView';

export default function EditRulePage({ params }: { params: { id: string } }) {
  return <RuleBuilderView ruleId={params.id} />;
}
