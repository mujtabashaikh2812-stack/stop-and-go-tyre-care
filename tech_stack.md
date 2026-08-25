# Tech Stack Specification - STOP & GO Tyre Care

## 1. Core Framework & Runtime
- **Frontend Framework**: React 18 (Vite 6 Bundler)
- **Language**: JavaScript (ES6+ / JSX)
- **Deployment & Target**: Responsive web application for desktop, tablet, and phone browsers

## 2. UI & Styling System
- **Styling Architecture**: Pure CSS Custom Properties (CSS Tokens), Glassmorphism Surfaces, Fluid Layout
- **Design Theme**: Automotive Dark Mode Dashboard (`#0B1120`, `#1E293B`, `#334155`)
- **Accent Palette**: 
  - Amber / Gold: `#F59E0B` (Primary Active & Branding)
  - Cyan / Neon Blue: `#06B6D4` (Interactive Toggles & Data Callouts)
  - Emerald Green: `#10B981` (Completed Status & Money Totals)
  - Ruby Red: `#EF4444` (Low Stock Alerts & Deletions)

## 3. Data Storage & State Management
- **Persistence Layer**: Web `localStorage` API with structured JSON schemas
- **State Management**: React Context / Custom Reactive Hooks (`useJobCards`, `useInventory`)
- **Data Fallback**: Automatic initialization with realistic pre-populated mock dataset (`mockData.js`)

## 4. Hardware & Communication Integration
- **Printing**: Browser CSS `@media print` thermal receipt layout (80mm width standard)
- **WhatsApp Direct**: `https://wa.me/` deep-linking with auto-formatted UTF-8 invoice messages
