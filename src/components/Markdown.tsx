import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Props {
  text?: string | string[];
}

export const Markdown = ({ text }: Props) => {
  if (!text) return null;

  const children = Array.isArray(text) ? text.join('\n\n') : text;

  return <ReactMarkdown rehypePlugins={[rehypeRaw]} children={children} />;
};
