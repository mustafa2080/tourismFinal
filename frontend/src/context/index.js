// Context Export File
// Export all contexts from a central location

export { AuthContext, AuthProvider } from './AuthContext.jsx';
export { NotificationContext, NotificationProvider } from './NotificationContext.jsx';
export { ThemeContext, ThemeProvider } from './ThemeContext.jsx';
export { CartContext, CartProvider } from './CartContext.jsx';
export { WishlistContext, WishlistProvider } from './WishlistContext.jsx';
export { LanguageContext, LanguageProvider } from './LanguageContext.jsx';

// Usage:
// import { AuthProvider, NotificationProvider, ThemeProvider } from './context';
// OR wrap in App.jsx like:
// <AuthProvider>
//   <NotificationProvider>
//     <ThemeProvider>
//       <CartProvider>
//         <App />
//       </CartProvider>
//     </ThemeProvider>
//   </NotificationProvider>
// </AuthProvider>
