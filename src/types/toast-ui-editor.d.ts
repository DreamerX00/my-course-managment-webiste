declare module "@toast-ui/editor" {
  export interface EditorOptions {
    el: HTMLElement;
    height?: string;
    initialEditType?: "markdown" | "wysiwyg";
    previewStyle?: "tab" | "vertical";
    initialValue?: string;
    placeholder?: string;
    theme?: string;
    usageStatistics?: boolean;
    events?: {
      change?: () => void;
      [key: string]: (() => void) | undefined;
    };
    hooks?: {
      addImageBlobHook?: (
        blob: Blob,
        callback: (url: string, altText: string) => void
      ) => void;
    };
  }

  export default class Editor {
    constructor(options: EditorOptions);
    getMarkdown(): string;
    getHTML(): string;
    setMarkdown(markdown: string, cursorToEnd?: boolean): void;
    destroy(): void;
    on(event: string, callback: () => void): void;
    off(event: string): void;
    getCurrentPreviewStyle(): "tab" | "vertical";
    changePreviewStyle(style: "tab" | "vertical"): void;
    setHeight(height: string): void;
    getHeight(): string;
  }
}

declare module "@toast-ui/editor/dist/toastui-editor-viewer" {
  export interface ViewerOptions {
    el: HTMLElement;
    initialValue?: string;
  }

  export default class Viewer {
    constructor(options: ViewerOptions);
    setMarkdown(markdown: string): void;
    destroy(): void;
  }
}

declare module "@toast-ui/editor/dist/toastui-editor.css" {
  const content: string;
  export default content;
}

declare module "@toast-ui/editor/dist/theme/toastui-editor-dark.css" {
  const content: string;
  export default content;
}
