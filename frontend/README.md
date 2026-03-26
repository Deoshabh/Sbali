# Sbali - Premium Handcrafted Shoes E-Commerce Frontend

A modern, fully-featured e-commerce frontend built with Next.js 14 and Tailwind CSS for a premium handcrafted shoes website.

## Features

### 🎨 Enterprise-Level UI/UX

- Professional design system with custom Tailwind config
- Glassmorphism effects and smooth animations
- Responsive design (mobile-first approach)
- Premium typography with Playfair Display and Inter fonts

### 🛍️ Shopping Experience

- Product listing with advanced filters (category, price range)
- Multiple sort options (Featured, Price, Name)
- Real-time search with autocomplete
- Product detail pages with image gallery
- Size selection and stock management

### 🛒 Cart & Wishlist

- Persistent cart management
- Real-time cart count updates
- Wishlist functionality
- Guest checkout prevention with auth redirect

### 🔐 Authentication

- User registration and login
- JWT-based authentication with automatic refresh
- Protected routes
- User profile management

### 📱 Responsive Design

- Desktop: Full-featured sidebar filters, multi-column grids
- Tablet: Optimized layouts, collapsible filters
- Mobile: Touch-friendly controls, modal filters

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with React Icons
- **Notifications**: React Hot Toast
- **Authentication**: JWT with httpOnly cookies

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `<http://localhost:5000`>

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file (already created):

```env
NEXT_PUBLIC_API_URL=<http://localhost:5000/api>
```

4. Run the development server:

```bash
npm run dev
```

5. Open [<http://localhost:3000](<http://localhost:300>0>) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── products/        # Product pages
│   │   │   └── [slug]/      # Dynamic product detail
│   │   ├── cart/            # Shopping cart
│   │   ├── wishlist/        # Wishlist page
│   │   ├── layout.jsx       # Root layout
│   │   ├── page.jsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ProductCard.jsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   └── utils/               # Utility functions
│       └── api.js           # API client and endpoints
├── public/                  # Static assets
├── .env.local              # Environment variables
├── next.config.mjs         # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies
```

## Key Features Explained

### API Integration

The `src/utils/api.js` file provides:

- Axios instance with automatic auth token injection
- Automatic token refresh on 401 errors
- Organized API endpoints for all features
- Error handling and retry logic

### Context Providers

Three main contexts manage global state:

- **AuthContext**: User authentication state
- **CartContext**: Shopping cart management
- **WishlistContext**: Wishlist management

### Design System

Custom Tailwind configuration includes:

- Color palette: Stone (primary) + Brand colors (brown, tan, cream)
- Spacing scale: xs to 3xl (8px to 64px)
- Animation keyframes: fade-in, slide-down, scale-in
- Shadow system: sm to 2xl
- Custom component classes: btn, input, card, badge

## API Endpoints Used

- **Auth**: `/api/auth/*` - Register, login, logout, refresh
- **Products**: `/api/products` - Get all, search, filter, sort
- **Categories**: `/api/categories` - Get categories
- **Cart**: `/api/cart` - CRUD operations
- **Wishlist**: `/api/wishlist` - Add/remove products
- **Orders**: `/api/orders` - Create, view orders
- **Addresses**: `/api/addresses` - Manage shipping addresses

## Environment Variables

```env
NEXT_PUBLIC_API_URL=<http://localhost:5000/api>
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Design Highlights

### Color Scheme

- Primary: Stone (neutral grays)
- Brand Brown: #3d2f28
- Brand Tan: #8b7355
- Brand Cream: #d4c4b0

### Typography

- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

### Animations

- Smooth transitions: 200-300ms
- Hover effects: shadow, transform, color changes
- Loading states: spinners and skeleton screens

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please contact: <info@sbali.com>

---

Built with ❤️ using Next.js and Tailwind CSS


