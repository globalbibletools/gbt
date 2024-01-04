import { useEditor, EditorContent } from '@tiptap/react';
import { extensions } from './form/RichTextInput';
import { useEffect } from 'react';

export interface RichTextProps {
  className?: string;
  content: string;
}

export default function RichText({ content, className = '' }: RichTextProps) {
  const editor = useEditor({
    extensions,
    editable: false,
  });

  useEffect(() => {
    editor?.commands.setContent(content);
  }, [editor?.commands, content]);

  return <EditorContent editor={editor} className={className} />;
}
