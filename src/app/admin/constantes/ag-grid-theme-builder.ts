import { themeQuartz } from 'ag-grid-community';
import type { Theme } from 'ag-grid-community';

export const myTheme: Theme = themeQuartz.withParams({
        accentColor: "#416273",
        browserColorScheme: "light",
        columnBorder: true,
        fontSize: 10,
        headerFontSize: 10,
        headerFontWeight: 600,
        headerVerticalPaddingScale: 0.4,
        rowVerticalPaddingScale: 0.52,
        wrapperBorderRadius: 0
    });
