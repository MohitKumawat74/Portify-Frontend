import TemplatePreviewPage from '@/app/(public)/templates/preview/[templateId]/page';

interface Props {
  params: {
    templateSlug: string;
  };
}

export default function StandaloneTemplatePreviewPage({ params }: Props) {
  return <TemplatePreviewPage params={{ templateId: params.templateSlug }} />;
}
