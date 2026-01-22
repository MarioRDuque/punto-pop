import { themeQuartz } from 'ag-grid-community';
import type { Theme } from 'ag-grid-community';

export const myTheme: Theme = themeQuartz.withParams({
        browserColorScheme: "light",
        fontFamily: [
            "Arial",
            "sans-serif"
        ],
        headerBackgroundColor: "#ff0000",
        headerFontSize: 14
    });
