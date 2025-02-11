import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			b1: '#684528',
  			'b1-light': '#8C6D4D',
  			b2: '#B09472',
  			b3: '#E5BC8F',
  			b4: '#EED9BF',
  			g1: '#3D5540',
  			g2: '#7D9277',
  			g3: '#A9CF9F',
  			error: 'rgb(248, 113, 113, .6)',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			shimmer1: {
  				'0%': {
  					transform: 'translateX(165%) skewX(-45deg)'
  				},
  				'12%': {
  					transform: 'translateX(-50%) skewX(-45deg)'
  				},
  				'75%': {
  					transform: 'translateX(-50%) skewX(-45deg)'
  				},
  				'100%': {
  					transform: 'translateX(165%) skewX(-45deg)'
  				}
  			},
  			shimmer2: {
  				'0%': {
  					transform: 'translateX(115%) skewX(-45deg)'
  				},
  				'12%': {
  					transform: 'translateX(-100%) skewX(-45deg)'
  				},
  				'75%': {
  					transform: 'translateX(-100%) skewX(-45deg)'
  				},
  				'100%': {
  					transform: 'translateX(115%) skewX(-45deg)'
  				}
  			},
  			shimmer3: {
  				'0%': {
  					transform: 'translateX(57.5%) skewX(-45deg)'
  				},
  				'12%': {
  					transform: 'translateX(-157.5%) skewX(-45deg)'
  				},
  				'75%': {
  					transform: 'translateX(-157.5%) skewX(-45deg)'
  				},
  				'100%': {
  					transform: 'translateX(57.5%) skewX(-45deg)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					transform: 'scale(0)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			'scale-out': {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'100%': {
  					transform: 'scale(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			shimmer1: 'shimmer1 10s infinite',
  			shimmer2: 'shimmer2 10s infinite',
  			shimmer3: 'shimmer3 10s infinite',
  			'scale-in': 'scale-in 2s ease-out',
  			'scale-in-fast': 'scale-in 0.1s ease-out',
  			'scale-out': 'scale-out 2s ease-out',
  			'scale-out-fast': 'scale-out 0.1s ease-out'
  		},
  		transitionDelay: {
  			'400': '400ms'
  		},
  		rotate: {
  			'30': '30deg',
  			'210': '210deg'
  		},
  		dropShadow: {
  			text: '0 1.2px 1.2px rgba(0,0,0,1)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
