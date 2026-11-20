export type Locale = 'bn' | 'en';

export type InputMode = 'file' | 'text';

export type ActiveTab = 'portal' | 'gallery' | 'history';

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export type PageSizeKey = 'a4' | 'letter' | 'legal' | 'slide16x9';

export type RenderScale = 1 | 1.5 | 2;

export type PipelineStage =
  | 'idle'
  | 'parsing'
  | 'rendering_pages'
  | 'building_pdf'
  | 'packing_zip'
  | 'done'
  | 'error';

export interface PageSizeSpec {
  key: PageSizeKey;
  label: string;
  /** Width in CSS pixels at 96 DPI */
  widthPx: number;
  /** Height in CSS pixels at 96 DPI */
  heightPx: number;
  /** Width in PDF points (72 DPI) */
  widthPt: number;
  /** Height in PDF points (72 DPI) */
  heightPt: number;
  /** Page margin in CSS pixels at 96 DPI */
  marginPx: number;
}

export interface ConversionSettings {
  imageFormat: ImageFormat;
  pageSize: PageSizeKey;
  scale: RenderScale;
  autoDownloadZip: boolean;
  autoConvertOnPaste: boolean;
  jpegQuality: number;
}

export interface PipelineProgressState {
  stage: PipelineStage;
  currentPage: number;
  totalPages: number;
  percent: number;
  elapsedMs: number;
  sourceName: string;
  charCount: number;
  errorMessage?: string;
}

export interface ConvertedPageImage {
  pageNumber: number;
  filename: string;
  mimeType: string;
  byteLength: number;
  width: number;
  height: number;
  previewUrl: string;
}

export interface ConversionJobResult {
  id: string;
  sourceName: string;
  createdAt: number;
  charCount: number;
  pageCount: number;
  renderMode: 'rich-html' | 'fast-text';
  imageFormat: ImageFormat;
  pageSize: PageSizeKey;
  elapsedMs: number;
  pdfFilename: string;
  pdfSizeBytes: number;
  pdfUrl: string;
  zipFilename: string;
  zipSizeBytes: number;
  zipUrl: string;
  autoDownloaded: boolean;
  pages: ConvertedPageImage[];
}
