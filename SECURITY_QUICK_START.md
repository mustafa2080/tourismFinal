## 🚀 Security Integration Guide for Developers

Quick reference for integrating security features into your components.

---

## 1️⃣ Form Security (Most Common)

### Before (Insecure):
```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiClient.post('/api/auth/login', { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // ❌ No validation
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // ❌ No validation
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### After (Secure):
```jsx
import { useInputValidation } from '../hooks/useInputValidation.js';

function LoginForm() {
  const { values, errors, handleChange, handleBlur, handleSubmit, hasError } = useInputValidation(
    { email: '', password: '' },
    {
      email: { type: 'email', required: true },
      password: { type: 'password', required: true }
    }
  );

  const onSubmit = async (formData) => {
    await apiClient.post('/api/auth/login', formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={hasError('email') ? 'error' : ''} // ✅ Visual error feedback
        />
        {hasError('email') && <span className="error-msg">{errors.email[0]}</span>}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={hasError('password') ? 'error' : ''}
        />
        {hasError('password') && <span className="error-msg">{errors.password[0]}</span>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 2️⃣ Display User Content Safely

### Before (Insecure - XSS Vulnerability):
```jsx
function Comment({ comment }) {
  return (
    <div className="comment">
      <p>{comment.author}</p>
      <p>{comment.text}</p> {/* ❌ Renders HTML directly */}
    </div>
  );
}
```

### After (Secure):
```jsx
import { sanitizeText } from '../utils/sanitizer.js';

function Comment({ comment }) {
  return (
    <div className="comment">
      <p>{sanitizeText(comment.author)}</p>
      <p>{sanitizeText(comment.text)}</p> {/* ✅ HTML escaped */}
    </div>
  );
}
```

---

## 3️⃣ Rich Text Display

### Before (Insecure):
```jsx
function BlogPost({ post }) {
  return (
    <div dangerouslySetInnerHTML={{
      __html: post.content // ❌ XSS vulnerability
    }} />
  );
}
```

### After (Secure):
```jsx
import { sanitizeHTML } from '../utils/sanitizer.js';

function BlogPost({ post }) {
  return (
    <div dangerouslySetInnerHTML={{
      __html: sanitizeHTML(post.content) // ✅ Sanitized HTML
    }} />
  );
}
```

---

## 4️⃣ API Requests (CSRF Token)

### Before (Now Automatically Protected):
```jsx
// No longer needed - CSRF token is automatic!
function CreateBooking() {
  const handleSubmit = async (formData) => {
    await apiClient.post('/api/bookings', formData); // ✅ CSRF token auto-included
  };
}
```

### How It Works:
- App loads → CSRF token initialized automatically
- All POST/PUT/DELETE requests include CSRF token
- Backend validates before processing
- **You don't need to do anything!**

---

## 5️⃣ Custom Validation Rules

```jsx
import { useInputValidation } from '../hooks/useInputValidation.js';

function PhoneForm() {
  const { values, errors, handleChange, handleSubmit } = useInputValidation(
    { phone: '' },
    {
      phone: {
        type: 'phone',
        required: true,
        minLength: 10,
        maxLength: 15,
        pattern: /^[\d\s\-\+\(\)]+$/
      }
    }
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="phone" {...values} onChange={handleChange} />
    </form>
  );
}
```

---

## 6️⃣ Object Sanitization

### Sanitize Entire Objects:
```jsx
import { sanitizeObject } from '../utils/sanitizer.js';

function processUserData(userData) {
  // Recursively sanitize all string fields
  const safeData = sanitizeObject(userData, 'text');
  return safeData;
}

// Example:
const userInput = {
  name: '<script>alert(1)</script>John',
  email: 'john@example.com',
  profile: {
    bio: '<img src=x onerror="alert(1)">Developer'
  }
};

const safeInput = sanitizeObject(userInput, 'text');
// Result:
// {
//   name: 'alertalertJohn', (script tags removed)
//   email: 'john@example.com',
//   profile: {
//     bio: 'Developer' (img tag removed)
//   }
// }
```

---

## 7️⃣ Detect Malicious Input

```jsx
import { detectXSSPatterns } from '../utils/sanitizer.js';

function validateUserInput(input) {
  if (detectXSSPatterns(input)) {
    console.warn('⚠️ Suspicious input detected!');
    return false;
  }
  return true;
}

// Examples:
detectXSSPatterns('<script>alert(1)</script>'); // true - detected
detectXSSPatterns('<img onerror="alert(1)">'); // true - detected
detectXSSPatterns('normal text'); // false - safe
```

---

## 8️⃣ Email & URL Validation

```jsx
import { sanitizeEmail, sanitizeURL } from '../utils/sanitizer.js';

function NewsletterForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const email = sanitizeEmail(e.target.email.value);
    if (!email) {
      alert('Invalid email');
      return;
    }
    
    // Safe to use
    sendNewsletter(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <button type="submit">Subscribe</button>
    </form>
  );
}

// URL sanitization
function LinkPreview({ url }) {
  const safeURL = sanitizeURL(url);
  if (!safeURL) {
    return <p>Invalid URL</p>;
  }
  
  return (
    <a href={safeURL} target="_blank" rel="noopener noreferrer">
      {safeURL}
    </a>
  );
}
```

---

## 9️⃣ Get Sanitization Report (for debugging)

```jsx
import { getSanitizationReport } from '../utils/sanitizer.js';

function DebugInput({ input }) {
  const sanitized = sanitizeInput(input);
  const report = getSanitizationReport(input, sanitized);

  console.log('Sanitization Report:');
  console.log(`  Original length: ${report.originalLength}`);
  console.log(`  Sanitized length: ${report.sanitizedLength}`);
  console.log(`  Chars removed: ${report.charsRemoved} (${report.percentageRemoved}%)`);
  console.log(`  Had XSS patterns: ${report.hadXSSPatterns}`);
  console.log(`  Is suspicious: ${report.isSuspicious}`);
}
```

---

## 🔟 Complete Secure Component Example

```jsx
import React, { useState } from 'react';
import { useInputValidation } from '../hooks/useInputValidation.js';
import { sanitizeText } from '../utils/sanitizer.js';
import apiClient from '../services/apiClient.js';

function SecureContactForm() {
  const { values, errors, handleChange, handleBlur, handleSubmit, hasError, isSubmitting } = useInputValidation(
    { name: '', email: '', subject: '', message: '' },
    {
      name: { type: 'name', required: true, minLength: 2, maxLength: 100 },
      email: { type: 'email', required: true },
      subject: { type: 'text', required: true, minLength: 5, maxLength: 200 },
      message: { type: 'text', required: true, minLength: 10, maxLength: 5000 }
    }
  );

  const onSubmit = async (formData) => {
    try {
      const response = await apiClient.post('/api/contact', formData);
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your full name"
            className={hasError('name') ? 'input-error' : 'input-normal'}
            disabled={isSubmitting}
          />
          {hasError('name') && (
            <span className="error-message">{errors.name[0]}</span>
          )}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="your.email@example.com"
            className={hasError('email') ? 'input-error' : 'input-normal'}
            disabled={isSubmitting}
          />
          {hasError('email') && (
            <span className="error-message">{errors.email[0]}</span>
          )}
        </div>

        {/* Subject Field */}
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            id="subject"
            type="text"
            name="subject"
            value={values.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Message subject"
            className={hasError('subject') ? 'input-error' : 'input-normal'}
            disabled={isSubmitting}
          />
          {hasError('subject') && (
            <span className="error-message">{errors.subject[0]}</span>
          )}
        </div>

        {/* Message Field */}
        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={values.message}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your message (max 5000 characters)"
            rows="6"
            className={hasError('message') ? 'input-error' : 'input-normal'}
            disabled={isSubmitting}
          />
          {hasError('message') && (
            <span className="error-message">{errors.message[0]}</span>
          )}
          <p className="char-count">
            {values.message.length} / 5000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-submit"
          disabled={isSubmitting || Object.values(errors).some(e => e)}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

export default SecureContactForm;
```

---

## 🎯 Security Checklist for New Components

- [ ] Use `useInputValidation` for all form inputs
- [ ] Sanitize user content with `sanitizeText()` or `sanitizeHTML()`
- [ ] Detect XSS patterns with `detectXSSPatterns()`
- [ ] Use `sanitizeEmail()` for email inputs
- [ ] Use `sanitizeURL()` for URL inputs
- [ ] Set `disabled={isSubmitting}` on submit button
- [ ] Show validation errors to users
- [ ] Don't use `dangerouslySetInnerHTML` without sanitization
- [ ] Enable error handling in API calls
- [ ] Test with malicious input examples

---

## 📚 Files Reference

| Component | Path | Usage |
|-----------|------|-------|
| Sanitizer Utils | `/utils/sanitizer.js` | Text/HTML sanitization |
| Validation Hook | `/hooks/useInputValidation.js` | Form validation |
| API Client | `/services/apiClient.js` | API requests with CSRF |
| App Component | `/App.jsx` | CSRF token initialization |

---

## ✅ Summary

All security features are **automatically integrated**:

1. ✅ **CSRF Protection** - Automatic in all POST/PUT/DELETE
2. ✅ **Input Validation** - Use the validation hook
3. ✅ **XSS Prevention** - Use sanitizer functions
4. ✅ **Password Security** - Backend enforced
5. ✅ **Rate Limiting** - Backend enforced
6. ✅ **Token Management** - Automatic refresh

**You just need to:**
1. Use `useInputValidation` for forms
2. Use `sanitizeText()` for display
3. Follow the secure component example above

---

**Last Updated**: 2025-01-24
**Ready to Use**: ✅ Yes
**Support**: Check `/backend/SECURITY_IMPLEMENTATION.md`
