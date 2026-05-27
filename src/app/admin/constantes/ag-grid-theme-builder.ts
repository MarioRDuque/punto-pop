import { themeQuartz } from 'ag-grid-community';
import type { Theme } from 'ag-grid-community';

const baseParams = {
    accentColor: "#416273",
    columnBorder: true,
    fontSize: 12,
    headerFontSize: 11,
    headerFontWeight: 600,
    headerVerticalPaddingScale: 0.4,
    rowVerticalPaddingScale: 0,
    wrapperBorderRadius: 0,
} as const;

export const myTheme: Theme = themeQuartz
    .withParams({ ...baseParams, browserColorScheme: 'light' }, 'light')
    .withParams({ ...baseParams, browserColorScheme: 'dark' }, 'dark')
;
