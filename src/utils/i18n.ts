import type { Locale } from '../types/converter';

export interface TranslationStrings {
  brandName: string;
  navPortal: string;
  navGallery: string;
  navHistory: string;
  langSwitchLabel: string;
  portalTitle: string;
  portalSubtitle: string;
  modeFile: string;
  modeText: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  dropzoneButton: string;
  dropzoneHint: string;
  quickTestsLabel: string;
  testInvoiceBtn: string;
  testLargeTextBtn: string;
  textFilenameLabel: string;
  textFilenamePlaceholder: string;
  textEditorLabel: string;
  textEditorPlaceholder: string;
  convertNowBtn: string;
  convertingBtn: string;
  clearTextBtn: string;
  pasteAutoNote: string;
  charsUnit: string;
  estPagesPrefix: string;
  pagesUnit: string;
  emptyInputError: string;
  unsupportedFileError: string;
  settingsHeading: string;
  imageFormatLabel: string;
  pageSizeLabel: string;
  resolutionLabel: string;
  scaleFast: string;
  scaleStandard: string;
  scaleHd: string;
  automationHeading: string;
  autoDownloadLabel: string;
  autoDownloadHint: string;
  autoPasteLabel: string;
  autoPasteHint: string;
  stageParse: string;
  stageRender: string;
  stagePdf: string;
  stageZip: string;
  autoDownloadedBanner: string;
  readyBanner: string;
  redownloadZipBtn: string;
  downloadPdfBtn: string;
  newConvertBtn: string;
  galleryHeading: string;
  galleryEmptyTitle: string;
  galleryEmptyDesc: string;
  goToPortalBtn: string;
  showMorePagesBtn: string;
  showingPagesPrefix: string;
  historyHeading: string;
  historyEmptyText: string;
  historyClearBtn: string;
  downloadZipShort: string;
  downloadPdfShort: string;
  viewGalleryShort: string;
  closePreviewLabel: string;
  prevPageLabel: string;
  nextPageLabel: string;
  pageLabel: string;
  engineRichHtml: string;
  engineFastText: string;
  batchProgressPrefix: string;
}

export const TRANSLATIONS: Record<Locale, TranslationStrings> = {
  bn: {
    brandName: 'SnapSheet',
    navPortal: 'পোর্টাল',
    navGallery: 'গ্যালারি',
    navHistory: 'ইতিহাস',
    langSwitchLabel: 'EN',
    portalTitle: 'HTML থেকে সরাসরি PDF, ছবি ও ZIP',
    portalSubtitle: 'লগইন ছাড়াই HTML ফাইল আপলোড বা লক্ষ লক্ষ টেক্সট পেস্ট করুন — সাথে সাথে PDF ও ছবি তৈরি হয়ে ZIP অটো ডাউনলোড হবে।',
    modeFile: 'ফাইল আপলোড',
    modeText: 'HTML কোড / টেক্সট',
    dropzoneTitle: 'HTML বা টেক্সট ফাইল এখানে ছেড়ে দিন',
    dropzoneSubtitle: 'ফাইল সিলেক্ট বা ড্রপ করার সাথে সাথেই PDF → ছবি → ZIP তৈরি হয়ে অটোমেটিক ডাউনলোড শুরু হবে',
    dropzoneButton: 'ফাইল নির্বাচন করুন',
    dropzoneHint: 'সাপোর্ট করে .html, .htm, .txt — একাধিক ফাইল একসাথে দেওয়া যাবে',
    quickTestsLabel: 'দ্রুত টেস্ট করুন:',
    testInvoiceBtn: 'স্যাম্পল HTML রিপোর্ট',
    testLargeTextBtn: '১ লক্ষ অক্ষর টেস্ট',
    textFilenameLabel: 'আউটপুট ফাইলের নাম',
    textFilenamePlaceholder: 'document',
    textEditorLabel: 'HTML কোড অথবা বিশাল টেক্সট লিখুন বা পেস্ট করুন',
    textEditorPlaceholder: 'এখানে আপনার HTML কোড (<!DOCTYPE html>...) অথবা লক্ষ লক্ষ অক্ষরের টেক্সট পেস্ট করুন...',
    convertNowBtn: 'কনভার্ট ও অটো-ডাউনলোড ZIP',
    convertingBtn: 'কনভার্ট হচ্ছে...',
    clearTextBtn: 'টেক্সট মুছুন',
    pasteAutoNote: 'পেস্ট অটো-কনভার্ট চালু আছে — টেক্সট পেস্ট করলেই সাথে সাথে ZIP ডাউনলোড হবে',
    charsUnit: 'অক্ষর',
    estPagesPrefix: 'আনুমানিক',
    pagesUnit: 'পেজ',
    emptyInputError: 'অনুগ্রহ করে প্রথমে HTML কোড বা টেক্সট লিখুন অথবা একটি ফাইল আপলোড করুন।',
    unsupportedFileError: 'শুধুমাত্র .html, .htm অথবা .txt ফাইল আপলোড করা যাবে।',
    settingsHeading: 'আউটপুট সেটিংস',
    imageFormatLabel: 'ছবির ফরম্যাট',
    pageSizeLabel: 'পেজ সাইজ',
    resolutionLabel: 'কোয়ালিটি ও গতি',
    scaleFast: '1x দ্রুত',
    scaleStandard: '1.5x মানসম্মত',
    scaleHd: '2x HD',
    automationHeading: 'অটোমেশন',
    autoDownloadLabel: 'অটো ZIP ডাউনলোড',
    autoDownloadHint: 'কাজ শেষ হওয়া মাত্র নিজেই ডাউনলোড হবে',
    autoPasteLabel: 'পেস্ট করলেই কনভার্ট',
    autoPasteHint: 'টেক্সট বক্সে পেস্ট করলেই সাথে সাথে শুরু হবে',
    stageParse: '১. HTML প্রসেস',
    stageRender: '২. পেজ → ছবি',
    stagePdf: '৩. PDF তৈরি',
    stageZip: '৪. ZIP ডাউনলোড',
    autoDownloadedBanner: 'ZIP ফাইল অটোমেটিক ডাউনলোড সম্পন্ন হয়েছে',
    readyBanner: 'PDF ও ছবির ZIP ফাইল প্রস্তুত',
    redownloadZipBtn: 'আবার ZIP ডাউনলোড',
    downloadPdfBtn: 'PDF ডাউনলোড',
    newConvertBtn: 'নতুন ফাইল',
    galleryHeading: 'কনভার্ট হওয়া পেজ ছবি',
    galleryEmptyTitle: 'এখনো কোনো ছবি কনভার্ট হয়নি',
    galleryEmptyDesc: 'পোর্টাল থেকে HTML ফাইল আপলোড বা কোড পেস্ট করলে সব পেজের ছবি এখানে দেখা যাবে।',
    goToPortalBtn: 'পোর্টালে ফিরে যান',
    showMorePagesBtn: 'আরও পেজ দেখুন',
    showingPagesPrefix: 'দেখানো হচ্ছে',
    historyHeading: 'সাম্প্রতিক কনভার্সন',
    historyEmptyText: 'এই সেশনে এখনো কোনো কনভার্সন হয়নি। ফাইল আপলোড বা কোড পেস্ট করে শুরু করুন।',
    historyClearBtn: 'সব মুছুন',
    downloadZipShort: 'ZIP',
    downloadPdfShort: 'PDF',
    viewGalleryShort: 'ছবি দেখুন',
    closePreviewLabel: 'প্রিভিউ বন্ধ করুন',
    prevPageLabel: 'আগের পেজ',
    nextPageLabel: 'পরের পেজ',
    pageLabel: 'পেজ',
    engineRichHtml: 'HTML রেন্ডার',
    engineFastText: 'হাই-স্পিড টেক্সট',
    batchProgressPrefix: 'ফাইল',
  },
  en: {
    brandName: 'SnapSheet',
    navPortal: 'Portal',
    navGallery: 'Gallery',
    navHistory: 'History',
    langSwitchLabel: 'বাংলা',
    portalTitle: 'Instant HTML to PDF, Images & ZIP',
    portalSubtitle: 'No login required. Drop an HTML file or paste hundreds of thousands of characters — PDF, page images, and ZIP download automatically.',
    modeFile: 'File Upload',
    modeText: 'HTML Code / Text',
    dropzoneTitle: 'Drop HTML or text files here',
    dropzoneSubtitle: 'Conversion starts immediately on drop or selection and auto-downloads the images ZIP',
    dropzoneButton: 'Select Files',
    dropzoneHint: 'Supports .html, .htm, .txt — single or multiple files at once',
    quickTestsLabel: 'Quick tests:',
    testInvoiceBtn: 'Sample HTML Report',
    testLargeTextBtn: 'Test 100K Characters',
    textFilenameLabel: 'Output file name',
    textFilenamePlaceholder: 'document',
    textEditorLabel: 'Paste or type HTML code or massive text',
    textEditorPlaceholder: 'Paste your HTML code (<!DOCTYPE html>...) or hundreds of thousands of characters of text here...',
    convertNowBtn: 'Convert & Auto-Download ZIP',
    convertingBtn: 'Converting...',
    clearTextBtn: 'Clear Text',
    pasteAutoNote: 'Auto-convert on paste is active — pasting triggers instant ZIP download',
    charsUnit: 'chars',
    estPagesPrefix: 'Est.',
    pagesUnit: 'pages',
    emptyInputError: 'Please enter HTML code or text, or upload a file first.',
    unsupportedFileError: 'Only .html, .htm, or .txt files are supported.',
    settingsHeading: 'Output Settings',
    imageFormatLabel: 'Image Format',
    pageSizeLabel: 'Page Size',
    resolutionLabel: 'Quality & Speed',
    scaleFast: '1x Fast',
    scaleStandard: '1.5x Crisp',
    scaleHd: '2x HD',
    automationHeading: 'Automation',
    autoDownloadLabel: 'Auto-download ZIP',
    autoDownloadHint: 'Starts download immediately without clicking',
    autoPasteLabel: 'Auto-convert on paste',
    autoPasteHint: 'Triggers instant conversion when pasting text',
    stageParse: '1. Parse HTML',
    stageRender: '2. Render Pics',
    stagePdf: '3. Build PDF',
    stageZip: '4. ZIP Download',
    autoDownloadedBanner: 'ZIP archive downloaded automatically',
    readyBanner: 'PDF & Image ZIP archive ready',
    redownloadZipBtn: 'Download ZIP Again',
    downloadPdfBtn: 'Download PDF',
    newConvertBtn: 'New Conversion',
    galleryHeading: 'Converted Page Images',
    galleryEmptyTitle: 'No converted pages yet',
    galleryEmptyDesc: 'Upload an HTML file or paste code from the Portal to inspect every generated page image here.',
    goToPortalBtn: 'Back to Portal',
    showMorePagesBtn: 'Load More Pages',
    showingPagesPrefix: 'Showing',
    historyHeading: 'Recent Conversions',
    historyEmptyText: 'No conversions in this session yet. Drop a file or paste code to start.',
    historyClearBtn: 'Clear All',
    downloadZipShort: 'ZIP',
    downloadPdfShort: 'PDF',
    viewGalleryShort: 'Inspect',
    closePreviewLabel: 'Close preview',
    prevPageLabel: 'Previous page',
    nextPageLabel: 'Next page',
    pageLabel: 'Page',
    engineRichHtml: 'HTML Render',
    engineFastText: 'High-Speed Text',
    batchProgressPrefix: 'File',
  },
};
