import { themeQuartz } from 'ag-grid-community';
import type { Theme } from 'ag-grid-community';

export const myTheme: Theme = themeQuartz.withParams({
    accentColor: '#7c3aed',
    columnBorder: false,
    spacing: 6,
    fontSize: 12,
    headerFontSize: 11,
    headerFontWeight: 600,
    headerVerticalPaddingScale: 0.6,
    rowVerticalPaddingScale: 0,
    cellHorizontalPaddingScale: 0.7,
    wrapperBorderRadius: 0,
});
