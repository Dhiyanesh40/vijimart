import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'DM Sans', 'sans-serif'],
        luxury: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(16, 80, 40, 0.06), 0 4px 16px -4px rgba(16, 80, 40, 0.08)',
        'medium': '0 4px 16px -2px rgba(16, 80, 40, 0.10), 0 8px 32px -4px rgba(16, 80, 40, 0.14)',
        'strong': '0 8px 28px -4px rgba(16, 80, 40, 0.14), 0 20px 60px -8px rgba(16, 80, 40, 0.18)',
        'glow-green': '0 0 0 1px hsl(150 72% 30% / 0.15), 0 4px 20px -4px hsl(150 72% 30% / 0.35)',
        'glow-orange': '0 0 0 1px hsl(28 100% 54% / 0.2), 0 4px 20px -4px hsl(28 100% 54% / 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "300% 0" },
          "100%": { backgroundPosition: "-300% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-14px) rotate(1deg)" },
          "66%": { transform: "translateY(-7px) rotate(-1deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(150 72% 30% / 0.4)" },
          "50%": { boxShadow: "0 0 0 14px hsl(150 72% 30% / 0)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee2": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in": "slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scale-in 0.3s ease-out",
        "shimmer": "shimmer 2.5s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "marquee": "marquee 28s linear infinite",
        "marquee2": "marquee2 28s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
