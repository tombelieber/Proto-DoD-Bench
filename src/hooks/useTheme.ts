import { useEffect, useMemo, useState } from "react";
import { colorSchemeDark, themeBalham } from "ag-grid-community";
import { ThemeMode } from "../types";

export const useTheme = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem("themeMode");
        return (savedTheme as ThemeMode) || "system";
    });

    const currentTheme = useMemo(() => {
        if (themeMode === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return themeMode;
    }, [themeMode]);

    const myTheme = useMemo(() => {
        const isDark = currentTheme === "dark";
        return isDark ? themeBalham.withPart(colorSchemeDark) : themeBalham;
    }, [currentTheme]);

    useEffect(() => {
        const updateTheme = () => {
            if (themeMode === "system") {
                const systemDark = window.matchMedia(
                    "(prefers-color-scheme: dark)",
                ).matches;
                document.documentElement.setAttribute(
                    "data-theme",
                    systemDark ? "dark" : "light",
                );
            } else {
                document.documentElement.setAttribute("data-theme", themeMode);
            }
        };

        updateTheme();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (themeMode === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [themeMode]);

    useEffect(() => {
        localStorage.setItem("themeMode", themeMode);
    }, [themeMode]);

    const cycleTheme = () => {
        setThemeMode((prev) => {
            switch (prev) {
                case "light":
                    return "dark";
                case "dark":
                    return "system";
                case "system":
                    return "light";
                default:
                    return "system";
            }
        });
    };

    return {
        themeMode,
        currentTheme,
        myTheme,
        cycleTheme,
    };
};
