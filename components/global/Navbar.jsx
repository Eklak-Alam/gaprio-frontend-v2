'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Features', href: '/features' },
  { name: 'Integrations', href: '/integrations' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Enterprise', href: '/enterprise' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const pathname = usePathname();

  // Handle scroll state for pure blur effect (no border)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  // Framer Motion variants for mobile menu stagger
  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeOut' } },
    open: {
      opacity: 1, y: 0,
      transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
        <div
          className={`pointer-events-auto w-[90%] max-w-6xl rounded-full px-6 py-3 flex items-center justify-between transition-colors duration-500 ${
            isScrolled ? 'bg-[rgba(12,12,12,0.8)] backdrop-blur-xl' : 'bg-transparent'
          }`}
        >
          {/* Logo Section (Image Only) */}
          <Link href="/" className="flex items-center group z-50">
            <div className="relative w-32 h-8 transition-transform duration-300 group-hover:scale-105">
              <Image 
                src="/logo2.png" 
                alt="Gaprio Logo" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </Link>

          {/* Desktop Navigation with Magnetic Sliding Pill */}
          <nav 
            className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-1 rounded-full p-1"
            onMouseLeave={() => setHoveredIndex(null)} // Snaps back to active link when mouse leaves the nav
          >
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredIndex === index;
              // Determine if this specific link should have the pill right now
              const showPill = hoveredIndex !== null ? isHovered : isActive;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className="relative px-5 py-2 rounded-full group"
                >
                  {/* Sliding Pill Background */}
                  {showPill && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-primary-muted)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 text-sm transition-colors duration-300 ${
                    isActive || isHovered
                      ? 'text-[var(--color-foreground)] font-medium' 
                      : 'text-[var(--color-muted)]'
                  }`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth / CTA - Clean Brutalist Hover */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/register"
              className="px-5 py-2.5 text-sm font-medium bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-full transition-all duration-300 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 p-2 -mr-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors pointer-events-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-[var(--color-background)] pt-32 px-8 md:hidden flex flex-col"
          >
            <nav className="flex flex-col gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div key={link.name} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-3xl font-medium inline-block transition-all duration-300 ${
                        isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:translate-x-2'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            
            <motion.div variants={itemVariants} className="mt-16 flex flex-col gap-4">
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center text-[var(--color-foreground)] font-medium border border-[rgba(255,255,255,0.1)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center bg-[var(--color-foreground)] text-[var(--color-background)] font-medium rounded-full hover:bg-[var(--color-muted)] transition-colors duration-300"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}