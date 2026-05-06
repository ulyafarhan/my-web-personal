export class TiptapEditor {
  private editor: any = null;

  constructor(element: HTMLElement, initialContent: string = '', onUpdate?: (html: string) => void) {
    if (typeof window === 'undefined') return;
    
    // Dynamic import to avoid server-side execution of DOM-dependent code
    Promise.all([
      import('@tiptap/core'),
      import('@tiptap/starter-kit'),
      import('@tiptap/extension-link'),
      import('@tiptap/extension-image')
    ]).then(([{ Editor }, { default: StarterKit }, { default: Link }, { default: Image }]) => {
      this.editor = new Editor({
        element,
        extensions: [
          StarterKit,
          Link.configure({ openOnClick: false }),
          Image,
        ],
        content: initialContent,
        editorProps: {
          attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-sm',
          },
        },
        onUpdate: ({ editor }) => {
          if (onUpdate) onUpdate(editor.getHTML());
        },
      });
    });
  }

  public getHTML(): string {
    return this.editor?.getHTML() || '';
  }

  public setContent(content: string) {
    if (this.editor) {
      this.editor.commands.setContent(content);
    } else {
      // If editor isn't ready yet, we might need a better way, but for now:
      setTimeout(() => this.setContent(content), 100);
    }
  }

  public chain() {
    return this.editor?.chain();
  }

  public isActive(name: string, attributes?: any): boolean {
    return this.editor?.isActive(name, attributes) || false;
  }

  public destroy() {
    this.editor?.destroy();
  }
}
