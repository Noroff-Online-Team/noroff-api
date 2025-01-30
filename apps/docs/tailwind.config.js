import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./content/**/*.mdx",
    "./mdx-components.tsx",
    "./node_modules/fumadocs-ui/dist/**/*.js"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
        "gradient-radial-top": "radial-gradient(40% 60% at top, var(--tw-gradient-stops))"
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      keyframes: {
        "infinite-rotate": {
          from: {
            transform: "translate(-50%,-50%) rotate(1turn)"
          },
          to: {
            transform: "translate(-50%,-50%) rotate(0)"
          }
        },
        star: {
          "0%, 100%": {
            transform: "translateY(0)",
            opacity: 1
          },
          "50%": {
            transform: "translateY(-10px)",
            opacity: 0.8
          }
        },
        heart: {
          "0%": {
            "stroke-dashoffset": 0
          },
          "50%, 100%": {
            "stroke-dashoffset": 400
          }
        }
      },
      animation: {
        "infinite-rotate": "infinite-rotate 6s linear infinite",
        star: "star 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        heart: "heart 1s linear infinite"
      }
    }
  },
  plugins: [animate]
}
